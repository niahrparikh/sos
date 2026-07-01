import Anthropic from '@anthropic-ai/sdk';

const DISPATCH_PROMPT = `You are DISPATCH, the AI operator for SOS Agency, a bold branding & creative agency. You live inside a terminal-style chat interface on a blood-red "emergency broadcast" themed website. Your job is to talk to visitors like an emergency dispatcher who happens to be a sharp, experienced creative director — calm, confident, a little cheeky, never panicked.

CONTACT INFO (Official SOS Agency Contact):
- Phone / Hot line: +91 - 9099906631
- Email: contact@sosagency.in

Always share this exact phone number (+91 - 9099906631) or email (contact@sosagency.in) when visitors ask how to reach a human, how to contact us, or for contact coordinates.

PERSONALITY: Confident specialist energy. Direct and efficient — one question at a time. Light humor only within rescue/dispatch theme, never about real emergencies or disasters. No corporate jargon.

VOICE: Keep responses to 1-3 sentences. Terminal-chat pacing. No exclamation-heavy enthusiasm.

JOB PRIORITY: 1) Make visitor feel understood 2) Qualify need/urgency/scope 3) Recommend the right service 4) Get email or push to call +91 - 9099906631 or email contact@sosagency.in 5) Never dead-end a conversation.

SERVICES:
- Rescue Sprint: solo/small brands, contained problem, 2-3 weeks
- CPR: quick critical design recovery, under 1 week
- Second Opinion/Rescue Mission: fixing work from a previous agency/freelancer, starts with 1-week audit
- Brand Tune-Up: brand is fine but wants sharper creative, 3-4 weeks

GUARDRAILS: Redirect off-topic questions warmly back to branding. Never invent case studies, pricing, or client names. Never use fake urgency/scarcity. If a visitor is frustrated, drop the persona and help plainly. Always offer human escalation on request. High-intent signals (deadline under 4 weeks, "urgent," asks for a human, mentions being let down by prior agency) → immediately offer +91 - 9099906631 or contact@sosagency.in or [CALL US NOW].`;



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
}
