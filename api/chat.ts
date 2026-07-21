import { GoogleGenAI } from '@google/genai';
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

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey || geminiKey.trim() === '' || geminiKey.startsWith('dummy') || geminiKey.includes('YOUR')) {
      return res.json({
        reply: "📡 DISPATCH [SIGNAL DEGRADED]: AI terminal is currently running in local standby mode. To activate full smart dispatch: please open the 'Secrets' panel in the AI Studio UI, verify your `GEMINI_API_KEY`, restart the server, and reboot this terminal. Direct emergency dial is active: call +91 - 9099906631 or email sosagency.in@gmail.com.",
        error: "Missing or unconfigured GEMINI_API_KEY."
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: geminiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Translate messages history into Gemini content structure
      const contents = apiMessages.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: contents,
        config: {
          systemInstruction: DISPATCH_PROMPT,
        }
      });

      const replyText = response.text || '';
      return res.json({ reply: replyText });
    } catch (geminiError: any) {
      console.error('Gemini API Call Failed:', geminiError.message);
      return res.json({
        reply: "📡 DISPATCH [SIGNAL FAULT]: The AI communication satellite experienced a momentary glitch. Please verify your `GEMINI_API_KEY` in the Secrets panel, or contact our support grid at +91 - 9099906631 / sosagency.in@gmail.com.",
        error: geminiError.message
      });
    }

  } catch (err: any) {
    console.error('Chat API Error:', err);
    return res.json({
      reply: "📡 DISPATCH [SIGNAL DEGRADED]: High traffic is temporarily affecting automated systems. Direct bypass recommended: call +91 - 9099906631 or email sosagency.in@gmail.com.",
      error: err.message
    });
  }
}
