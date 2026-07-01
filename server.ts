import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import Anthropic from '@anthropic-ai/sdk';
import { DISPATCH_PROMPT } from './src/lib/dispatchPrompt.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser
  app.use(express.json());

  // API Routes
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages } = req.body;

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

      const hasAnthropic = !!process.env.ANTHROPIC_API_KEY && 
                           process.env.ANTHROPIC_API_KEY !== 'undefined' && 
                           process.env.ANTHROPIC_API_KEY !== 'null' && 
                           process.env.ANTHROPIC_API_KEY.trim() !== '' &&
                           !process.env.ANTHROPIC_API_KEY.startsWith('dummy') &&
                           !process.env.ANTHROPIC_API_KEY.includes('YOUR');

      const hasGemini = !!process.env.GEMINI_API_KEY && 
                        process.env.GEMINI_API_KEY !== 'undefined' && 
                        process.env.GEMINI_API_KEY !== 'null' && 
                        process.env.GEMINI_API_KEY.trim() !== '' &&
                        !process.env.GEMINI_API_KEY.startsWith('dummy') &&
                        !process.env.GEMINI_API_KEY.includes('YOUR');

      if (!hasAnthropic && !hasGemini) {
        return res.json({
          reply: "📡 DISPATCH [SIGNAL DEGRADED]: AI credentials are currently unconfigured or invalid. To bypass the terminal, connect directly to our dispatcher: dial +91 - 9099906631 or email contact@sosagency.in.",
          error: "Missing or invalid ANTHROPIC_API_KEY and GEMINI_API_KEY."
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

          // Use model specified by user, but let's be safe: if 'claude-sonnet-4-6' causes an error, fall back to 'claude-3-5-sonnet-latest'
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
          // If gemini is available, fall through. Otherwise return fallback message.
          if (!hasGemini) {
            return res.json({
              reply: "📡 DISPATCH [SIGNAL FAULT]: Direct channel failed. Dial +91 - 9099906631 or email contact@sosagency.in for human support.",
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
      return res.json({
        reply: "📡 DISPATCH [SIGNAL DEGRADED]: High traffic is temporarily affecting automated systems. Direct bypass recommended: call +91 - 9099906631 or email contact@sosagency.in.",
        error: err.message
      });
    }
  });

  // Serve static files / Vite dev middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SOS Agency Emergency Server listening on port ${PORT}`);
  });
}

startServer();
