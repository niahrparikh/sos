import { GoogleGenAI } from '@google/genai';
import Anthropic from '@anthropic-ai/sdk';
import { DISPATCH_PROMPT } from '../src/lib/dispatchPrompt.js';

export default async function handler(req: any, res: any) {
  // Set CORS headers for security and browser access
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages } = req.body || {};

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request: messages array is required.' });
    }

    // Filter out boot messages or system artifacts from sending to the API
    const apiMessages = messages.filter(
      (m: any) => m.role === 'user' || m.role === 'assistant'
    );

    // Simple capping of messages per session to control API costs (e.g. max 20 user messages)
    const userMessageCount = apiMessages.filter((m: any) => m.role === 'user').length;
    if (userMessageCount > 20) {
      return res.json({
        reply: "⚠️ SESSION CEILING REACHED (Max 20 signals per session). Transmission bandwidth depleted. Please bypass terminal protocols and trigger human escalation immediately via [CALL US NOW]."
      });
    }

    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
    const hasGemini = !!process.env.GEMINI_API_KEY;

    if (!hasAnthropic && !hasGemini) {
      return res.status(500).json({
        reply: "Signal is a bit weak right now — API keys are not configured. Try again or hit [CALL US NOW] to skip straight to a human.",
        error: "Missing ANTHROPIC_API_KEY and GEMINI_API_KEY."
      });
    }

    // Case 1: Anthropic API Key is set
    if (hasAnthropic) {
      try {
        const anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });

        // Standardize roles for Anthropic (must be user/assistant only)
        const formattedMessages: { role: 'user' | 'assistant'; content: string }[] = apiMessages.map((msg: any) => ({
          role: msg.role === 'assistant' ? ('assistant' as const) : ('user' as const),
          content: msg.content,
        }));

        let modelName = 'claude-3-5-sonnet-latest';
        
        const response = await anthropic.messages.create({
          model: modelName,
          max_tokens: 500,
          system: DISPATCH_PROMPT,
          messages: formattedMessages,
        });

        const replyText = response.content
          .filter((c: any) => c.type === 'text')
          .map((c: any) => c.text)
          .join('\n');

        return res.json({ reply: replyText });
      } catch (anthropicError: any) {
        console.error('Anthropic API Call Failed, falling back to Gemini if available:', anthropicError.message);
        if (!hasGemini) {
          return res.json({
            reply: "Signal's a bit weak right now — try again, or hit [CALL US NOW] to skip straight to a human.",
            error: anthropicError.message
          });
        }
      }
    }

    // Case 2: Gemini API Key is set (either as default or fallback)
    if (hasGemini) {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Format history for Gemini (roles: 'user' or 'model')
      const contents = apiMessages.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const modelsToTry = ['gemini-3.5-flash', 'gemini-3.1-flash-lite'];
      let lastError: any = null;
      let replyText = "";

      for (const modelName of modelsToTry) {
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            const response = await ai.models.generateContent({
              model: modelName,
              contents: contents,
              config: {
                systemInstruction: DISPATCH_PROMPT,
                temperature: 0.7,
              }
            });
            if (response.text) {
              replyText = response.text;
              break;
            }
          } catch (err: any) {
            lastError = err;
            console.warn(`[Gemini API] Attempt ${attempt} with model ${modelName} failed:`, err.message || err);
            if (attempt === 1) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }
        }
        if (replyText) {
          break;
        }
      }

      if (!replyText && lastError) {
        throw lastError;
      }

      const finalReply = replyText || "Signal's a bit weak right now — try again, or hit [CALL US NOW] to skip straight to a human.";
      return res.json({ reply: finalReply });
    }

  } catch (err: any) {
    console.error('Chat API Error:', err);
    return res.status(500).json({
      reply: "Signal's a bit weak right now — try again, or hit [CALL US NOW] to skip straight to a human.",
      error: err.message
    });
  }
}
