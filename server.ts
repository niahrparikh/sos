import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
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

  // Quotations persistence path setup
  const quotationsFilePath = path.join(__dirname, 'src', 'data', 'quotations.json');

  function getQuotations() {
    try {
      if (!fs.existsSync(quotationsFilePath)) {
        const initialData = [
          {
            id: 'q-seed-01',
            quotationNo: 'QT-2026-0001',
            clientName: 'ApexFlow Technologies',
            clientEmail: 'billing@apexflow.io',
            clientAddress: '404 Founders Tower, Palo Alto, CA 94301',
            date: '2026-07-03',
            expiryDate: '2026-08-02',
            items: [
              {
                id: 'qi-01',
                name: 'Creative Triage & Position Diagnosis',
                description: 'Crisis audit of brand assets, competitor mapping, and positioning blueprint.',
                quantity: 1,
                price: 4500
              },
              {
                id: 'qi-02',
                name: 'Identity Reconstruction & Visual Assets',
                description: 'Emergency custom logo, visual system, type treatment, and primary assets.',
                quantity: 1,
                price: 5500
              }
            ],
            subtotal: 10000,
            taxRate: 18,
            taxAmount: 1800,
            total: 11800,
            currency: 'USD',
            terms: '50% deposit required to initiate dispatch. 50% on asset delivery.',
            notes: 'Emergency project scheduled for immediate release.',
            status: 'sent'
          }
        ];
        const dir = path.dirname(quotationsFilePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(quotationsFilePath, JSON.stringify(initialData, null, 2), 'utf-8');
        return initialData;
      }
      const raw = fs.readFileSync(quotationsFilePath, 'utf-8');
      return JSON.parse(raw);
    } catch (error) {
      console.error('Error loading quotations, using in-memory fallback:', error);
      return [];
    }
  }

  function saveQuotations(data: any[]) {
    try {
      const dir = path.dirname(quotationsFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(quotationsFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving quotations file:', error);
    }
  }

  // Quotation Management Endpoints
  app.get('/api/quotations', (req, res) => {
    try {
      const list = getQuotations();
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/quotations', (req, res) => {
    try {
      const newQuotation = req.body;
      if (!newQuotation || !newQuotation.id) {
        return res.status(400).json({ error: 'Invalid quotation payload.' });
      }
      
      let list = getQuotations();
      const existingIdx = list.findIndex((q: any) => q.id === newQuotation.id);
      if (existingIdx > -1) {
        list[existingIdx] = newQuotation;
      } else {
        list.unshift(newQuotation);
      }
      
      saveQuotations(list);
      res.json({ success: true, quotation: newQuotation });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/quotations/:id', (req, res) => {
    try {
      const { id } = req.params;
      let list = getQuotations();
      const filtered = list.filter((q: any) => q.id !== id);
      saveQuotations(filtered);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/quotations/generate', async (req, res) => {
    try {
      const { prompt, clientDetails } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt description is required.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not defined in backend secrets.' });
      }

      const ai = new GoogleGenAI({ apiKey });

      const QUOTATION_GENERATOR_PROMPT = `
You are SOS Agency's senior corporate sales and dispatch assistant.
Your job is to analyze a sales team prompt/description (which details client needs, brand trouble, or custom service requests) and generate a structured quotation JSON object.
Always return valid JSON strictly matching the schema below. Do not return any explanatory text, markdown tags, or prefix - just return raw parseable JSON.

Schema:
{
  "clientName": string (Name of client company or contact person, e.g. "Acme Corp"),
  "clientEmail": string (E.g. contact@acme.com),
  "clientAddress": string (Corporate physical address),
  "items": [
    {
      "name": string (Clear, professional item title, e.g. "Crisis Brand Repositioning Support"),
      "description": string (Detailed outline of what services and deliverables are bundled in this item),
      "quantity": number (E.g. 1, 2, 3),
      "price": number (A realistic corporate price in digits, e.g. 2500, 4500, 1000)
    }
  ],
  "terms": string (Standard professional payment terms, e.g. "50% upfront, 50% upon delivery"),
  "notes": string (Custom professional note addressing client emergency/urgency)
}

Be realistic, professional, and thorough. Create 2 to 5 highly structured, clear, detailed line items that logically breakdown the requested services. Keep the text professional and clean.
`;

      const userContent = `
Analyze this prompt description:
"${prompt}"

Additional pre-filled client details if provided (use these if present):
${JSON.stringify(clientDetails || {})}

Please generate the quotation.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [userContent],
        config: {
          systemInstruction: QUOTATION_GENERATOR_PROMPT,
          responseMimeType: 'application/json',
        }
      });

      const replyText = response.text || '';
      let parsedQuote;
      try {
        parsedQuote = JSON.parse(replyText.trim());
      } catch (parseErr) {
        const jsonMatch = replyText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedQuote = JSON.parse(jsonMatch[0].trim());
        } else {
          throw parseErr;
        }
      }

      const dateNow = new Date();
      const dateStr = dateNow.toISOString().split('T')[0];
      const expDate = new Date();
      expDate.setDate(dateNow.getDate() + 30);
      const expDateStr = expDate.toISOString().split('T')[0];

      const formattedItems = (parsedQuote.items || []).map((item: any, index: number) => ({
        id: `qi-ai-${Date.now()}-${index}`,
        name: item.name || 'Creative Service Item',
        description: item.description || 'Professional dispatch support.',
        quantity: typeof item.quantity === 'number' ? item.quantity : 1,
        price: typeof item.price === 'number' ? item.price : 1500
      }));

      const subtotal = formattedItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
      const taxRate = clientDetails?.taxRate !== undefined ? Number(clientDetails.taxRate) : 18;
      const taxAmount = Math.round(subtotal * (taxRate / 100));
      const total = subtotal + taxAmount;

      const fullQuote = {
        id: `q-ai-${Date.now()}`,
        quotationNo: `QT-${dateNow.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        clientName: parsedQuote.clientName || clientDetails?.clientName || 'Apex Solutions Inc.',
        clientEmail: parsedQuote.clientEmail || clientDetails?.clientEmail || 'billing@apexsolutions.io',
        clientAddress: parsedQuote.clientAddress || clientDetails?.clientAddress || '123 Enterprise Way, CA',
        date: dateStr,
        expiryDate: expDateStr,
        items: formattedItems,
        subtotal,
        taxRate,
        taxAmount,
        total,
        currency: clientDetails?.currency || 'USD',
        terms: parsedQuote.terms || '50% deposit required. 50% upon final delivery of assets.',
        notes: parsedQuote.notes || 'Emergency brand optimization protocol.',
        status: 'draft'
      };

      res.json(fullQuote);
    } catch (err: any) {
      console.error('AI Quotation Generation Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

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
