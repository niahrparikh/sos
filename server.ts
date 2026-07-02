import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import { DISPATCH_PROMPT } from './src/lib/dispatchPrompt.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Circuit breaker state to permanently bypass Anthropic once it fails
let useGeminiPrimary = false;

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

      // Helper function to invoke Gemini backup satellite network
      const runGeminiFallback = async () => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error('GEMINI_API_KEY environment variable is not defined.');
        }

        const ai = new GoogleGenAI({
          apiKey: apiKey,
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

        return response.text || '';
      };

      const hasAnthropic = !useGeminiPrimary &&
                           !!process.env.ANTHROPIC_API_KEY && 
                           process.env.ANTHROPIC_API_KEY !== 'undefined' && 
                           process.env.ANTHROPIC_API_KEY !== 'null' && 
                           process.env.ANTHROPIC_API_KEY.trim() !== '' &&
                           !process.env.ANTHROPIC_API_KEY.startsWith('dummy') &&
                           !process.env.ANTHROPIC_API_KEY.includes('YOUR');

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

          const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-latest',
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
          // Switch to Gemini bypass permanently for future inputs
          useGeminiPrimary = true;
          console.log('Anthropic API connection rerouting via backup satellite network...');
          
          try {
            const fallbackReply = await runGeminiFallback();
            return res.json({ reply: fallbackReply });
          } catch (geminiError: any) {
            console.error('All backup communications failed:', geminiError.message);
            return res.json({
              reply: "📡 DISPATCH [SIGNAL FAULT]: The main Anthropic connection failed, and backup satellite communication is currently offline. Direct emergency dial is active: call +91 - 9099906631 or email contact@sosagency.in.",
              error: `Anthropic: ${anthropicError.message}. Gemini: ${geminiError.message}`
            });
          }
        }
      } else {
        // Transparent fallback to Gemini when Anthropic is bypassed or unconfigured
        try {
          const fallbackReply = await runGeminiFallback();
          return res.json({ reply: fallbackReply });
        } catch (geminiError: any) {
          console.error('Gemini communication bypassed/offline:', geminiError.message);
          return res.json({
            reply: "📡 DISPATCH [SIGNAL DEGRADED]: Satellite link unestablished. Direct connection active: please call +91 - 9099906631 or email contact@sosagency.in.",
            error: geminiError.message
          });
        }
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
