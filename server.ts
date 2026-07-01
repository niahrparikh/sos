import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
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

      if (!hasAnthropic) {
        return res.json({
          reply: "📡 DISPATCH [SIGNAL DEGRADED]: Claude AI terminal requires a valid `ANTHROPIC_API_KEY` to operate. To connect the real Claude AI: please open the 'Secrets' panel in the AI Studio UI, add a secret named `ANTHROPIC_API_KEY` with your Anthropic API key, restart the server, and reboot this terminal. Direct escalation dial is always available: +91 - 9099906631.",
          error: "Missing or unconfigured ANTHROPIC_API_KEY."
        });
      }

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
        console.error('Anthropic API Call Failed:', anthropicError.message);
        return res.json({
          reply: "📡 DISPATCH [SIGNAL FAULT]: The provided Anthropic API Key is invalid or expired. Please check your `ANTHROPIC_API_KEY` in the AI Studio Secrets panel, verify it has active credits, and try again. For human support: call +91 - 9099906631 or email contact@sosagency.in.",
          error: anthropicError.message
        });
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
