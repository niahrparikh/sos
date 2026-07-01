# SOS Agency — Blood-Red Emergency Terminal

A highly polished, high-craft brand emergency terminal interface and live-triage chatbot website for **SOS Agency**, a premium creative & positioning firm.

## ═══════════════════════════════════════
## LIVE DEMO & FULL-STACK SYSTEM (Vite + Express)
## ═══════════════════════════════════════

In this sandboxed workspace, the application is pre-configured and running as a complete full-stack **Vite (React 19) + Express** application.

- **Frontend**: Single-screen emergency terminal, typing mechanics, marquee tickers, count-up statistics, classified recovery show cases, horizontal process timeline, and a static emergency backup form.
- **Backend (server.ts)**: Express-driven API proxy (`/api/chat`) that routes distress signals to the Anthropic Claude API (using `ANTHROPIC_API_KEY`) with an automated fallback to the server-side Google Gemini API (using `GEMINI_API_KEY`) so that the application works seamlessly right out of the box!
- **Session Protection**: Implements a strict message capping limit (maximum 20 messages per session) on the server to prevent API cost overruns.

---

## ═══════════════════════════════════════
## VERCEL DEPLOYMENT (Next.js 14 App Router)
## ═══════════════════════════════════════

This project has been crafted to be instantly portable to **Next.js 14 App Router** for production hosting on Vercel. Below is the ready-to-copy code structure for your Next.js project.

### 1. Next.js 14 Claude Chat API Route
Create the file **`/app/api/chat/route.ts`** in your Next.js repository:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic Client server-side
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const DISPATCH_PROMPT = `You are DISPATCH, the AI operator for SOS Agency...`; // (Refer to /src/lib/dispatchPrompt.ts)

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array required.' }, { status: 400 });
    }

    // Filter messages for Anthropic
    const apiMessages = messages.filter(
      (m: any) => m.role === 'user' || m.role === 'assistant'
    );

    // Limit messages per session to control API costs
    const userMessages = apiMessages.filter((m: any) => m.role === 'user');
    if (userMessages.length > 20) {
      return NextResponse.json({
        reply: "⚠️ SESSION CEILING REACHED. Transmission lines are congested. Please bypass protocols and call us immediately."
      });
    }

    const formattedMessages = apiMessages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
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

    return NextResponse.json({ reply: replyText });
  } catch (err: any) {
    console.error('Chat API Error:', err);
    return NextResponse.json({
      reply: "Signal is a bit weak right now — try again, or hit [CALL US NOW] to skip straight to a human."
    }, { status: 500 });
  }
}
```

### 2. Vercel Project Environment Variables
To connect the live AI operator on Vercel, navigate to your **Vercel Project Dashboard > Settings > Environment Variables** and add:

- `ANTHROPIC_API_KEY` = `your_actual_claude_api_key`

---

## ═══════════════════════════════════════
## LOCAL DEVELOPMENT INSTRUCTIONS
## ═══════════════════════════════════════

To run this full-stack workspace locally on your machine:

1. **Extract and Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set up Environment Variables**:
   Create a `.env` or `.env.local` file in your root folder:
   ```env
   GEMINI_API_KEY="your_google_gemini_key"
   ANTHROPIC_API_KEY="your_anthropic_claude_key"
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The application boots instantly on `http://localhost:3000`.

4. **Production Build**:
   ```bash
   npm run build
   ```
   This compiles the frontend assets with Vite, bundles the Node server, and places the outputs into the `/dist` directory, fully prepared for lightweight cloud runtime execution.
