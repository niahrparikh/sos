export interface ConversationScenario {
  id: string;
  category: string;
  industry: string;
  persona: string;
  businessStage: string;
  userTriggers: string[];
  hiddenPainPoint: string;
  likelyRootCause: string;
  distressFirstResponse: string;
  followUpQuestion: string;
  signalsToCapture: string[];
  crmFields: string[];
  recommendedService: string;
  humanHandoffTrigger: string;
  conversationGoal: string;
  tags: string[];
}

export const CONVERSATION_LIBRARY: ConversationScenario[] = [
  {
    id: "001",
    category: "Lead Generation",
    industry: "SaaS",
    persona: "Founder",
    businessStage: "PMF",
    userTriggers: [
      "not getting enough inbound leads",
      "inbound leads are low",
      "need leads",
      "get leads",
      "pipeline slowing",
      "pipeline drying",
      "inbound has slowed",
      "lead generation",
      "lead gen"
    ],
    hiddenPainPoint: "Pipeline slowing & referral dependency limit predictable MRR velocity",
    likelyRootCause: "Over-reliance on historic organic referrals with zero scalable cold outbound or intent-targeted digital architectures.",
    distressFirstResponse: "Before recommending anything, I'd like to understand the context. What specific business outcome are you trying to improve, and when did you first notice this pipeline drop?",
    followUpQuestion: "How are you currently approaching inbound marketing, and what lead channels have you tested so far?",
    signalsToCapture: ["Role", "Company", "Website", "Industry", "Goal", "Urgency", "Tech Stack"],
    crmFields: ["Company", "Contact", "Role", "Industry", "Goal", "Challenge", "Buying Stage"],
    recommendedService: "Integrated B2B Demand Generation System",
    humanHandoffTrigger: "Pricing discussion, custom outbound scoping, or multiple stakeholders involved.",
    conversationGoal: "Isolate the referral dependency bottleneck, validate target ACV, and map a scalable inbound capture vector.",
    tags: ["lead-generation", "pipeline", "inbound"]
  },
  {
    id: "002",
    category: "Branding",
    industry: "D2C",
    persona: "Founder",
    businessStage: "Growth",
    userTriggers: [
      "don't remember our brand",
      "brand not memorable",
      "customers forget us",
      "branding",
      "rebrand",
      "logo design",
      "visual identity",
      "brand feels outdated"
    ],
    hiddenPainPoint: "Weak market differentiation and superficial alignment leading to high customer acquisition costs.",
    likelyRootCause: "Generic positioning that copies competitors, lacking emotional hook or distinctive assets in the brand narrative.",
    distressFirstResponse: "Before we discuss logos or colors, let's look deeper. When people interact with your brand, what is the single, clear belief they walk away with, and how does it differentiate you from your closest competitor?",
    followUpQuestion: "What prompted the decision to re-evaluate your brand identity right now? Is it high customer acquisition cost (CAC) or a product pivot?",
    signalsToCapture: ["Role", "Company", "Website", "Target Audience", "Competitors", "Budget"],
    crmFields: ["Company", "Contact", "Current Branding Pain", "Primary Competitor", "Timeline"],
    recommendedService: "SCOS Brand Reconstruction Package",
    humanHandoffTrigger: "Detailed rebranding scope, asset audit request, or identity design workshops.",
    conversationGoal: "Demonstrate that branding is a commercial positioning tool, not an aesthetic ornament, and outline a custom identity roadmap.",
    tags: ["branding", "positioning", "identity"]
  },
  {
    id: "003",
    category: "SEO",
    industry: "B2B",
    persona: "Marketing Head",
    businessStage: "Scale-up",
    userTriggers: [
      "organic traffic dropped",
      "organic traffic is flat",
      "seo drop",
      "google indexing",
      "technical seo",
      "not ranking",
      "google search",
      "seo"
    ],
    hiddenPainPoint: "Organic revenue stream risk due to algorithmic decay or crawling errors.",
    likelyRootCause: "Technical indexing issues, weak topical authority architectures, or algorithmic deprecation of outdated affiliate content styles.",
    distressFirstResponse: "Thanks for sharing that. Before recommending a technical audit, I'd like to understand the context. When did you first notice this organic drop, and is it a site-wide traffic decline or localized to core high-intent pages?",
    followUpQuestion: "Have you made any recent structural changes to your URL routing, CMS, or robots.txt file, or ran any mass AI-generated content programs?",
    signalsToCapture: ["Website", "Current SEO Tool", "CMS Type", "Keyword Targets", "Traffic Loss %"],
    crmFields: ["Company", "Contact", "Website CMS", "Traffic Deficit", "SEO Tool Stack"],
    recommendedService: "Topical Authority & Technical SEO Diagnostic",
    humanHandoffTrigger: "Advanced technical crawl reviews, API integration planning, or SEO retainer pricing.",
    conversationGoal: "Differentiate superficial keyword stuffing from real Topical Authority, identify immediate crawling errors, and outline an AI-resistant search strategy.",
    tags: ["seo", "technical-seo", "organic"]
  },
  {
    id: "004",
    category: "Website & CRO",
    industry: "Healthcare & B2B",
    persona: "Founder",
    businessStage: "Growth",
    userTriggers: [
      "website doesn't convert",
      "visitors don't convert",
      "low conversions",
      "high traffic low sales",
      "traffic is good but sales are low",
      "cro",
      "visitors leave",
      "bounce rate"
    ],
    hiddenPainPoint: "Severe leak in the digital conversion funnel wasting paid acquisition capital.",
    likelyRootCause: "Disconnect between landing page copy promises and target audience expectations, paired with high checkout/form friction.",
    distressFirstResponse: "Before suggesting page redesigns, I'd like to look at the numbers. What is your current visitor-to-conversion rate, and is this traffic coming from organic search, paid ads, or cold outreach?",
    followUpQuestion: "Where are users dropping off most frequently—immediately on the homepage, or after adding items to their cart/initiating a form?",
    signalsToCapture: ["Role", "Current Conversion Rate", "Traffic Channels", "Core Analytics Tool"],
    crmFields: ["Company", "Contact", "Current CR %", "Monthly Visitors", "Analytical Setup Status"],
    recommendedService: "High-Conversion UX Reconstruction & CRO",
    humanHandoffTrigger: "Framer/Shopify replatforming discussions, custom user testing, or full web builds.",
    conversationGoal: "Map visual layout and copy clarity issues, identify immediate UX friction points, and introduce the SCOS Conversion Optimization framework.",
    tags: ["website", "cro", "conversions"]
  },
  {
    id: "005",
    category: "Paid Ads",
    industry: "Ecommerce",
    persona: "Founder",
    businessStage: "Growth",
    userTriggers: [
      "meta ads stopped performing",
      "roas keeps dropping",
      "cpc keeps increasing",
      "paid ads failing",
      "facebook ads",
      "meta ads",
      "google ads",
      "ads aren't working",
      "roas"
    ],
    hiddenPainPoint: "Erosion of customer acquisition efficiency threating gross margin viability.",
    likelyRootCause: "Creative fatigue, lack of localized hooks, or bid constraints caused by suboptimal pixel feedback loops.",
    distressFirstResponse: "Before adjusting bids or budgets, let's analyze your creative performance. When did you first notice this ROAS drop, and what is your current blended customer acquisition cost (blended CAC) compared to customer lifetime value (LTV)?",
    followUpQuestion: "Are you relying primarily on standard image ads, or have you implemented a robust UGC (user-generated content) and short-form video testing matrix?",
    signalsToCapture: ["Monthly Ad Spend", "Current ROAS", "Core Ad Channel", "LTV:CAC Ratio"],
    crmFields: ["Company", "Contact", "Monthly Spend Limit", "Target ROAS", "Ad Accounts Active"],
    recommendedService: "SCOS Performance Creative Matrix Setup",
    humanHandoffTrigger: "Detailed ad account audit, custom creative production agreements, or multi-channel budget allocation planning.",
    conversationGoal: "Demonstrate that performance is driven by creative strategy and positioning, isolate bid fatigue from creative fatigue, and propose a structured visual testing protocol.",
    tags: ["paid-ads", "roas", "meta-ads", "google-ads"]
  },
  {
    id: "006",
    category: "Positioning",
    industry: "SaaS",
    persona: "CEO",
    businessStage: "Early",
    userTriggers: [
      "everyone compares us on price",
      "everyone compares us to competitors",
      "weak positioning",
      "price competition",
      "no differentiation",
      "how to differentiate",
      "commodity perception",
      "competitor analysis"
    ],
    hiddenPainPoint: "Lack of clean category definition resulting in low conversion rates and long sales cycles.",
    likelyRootCause: "Superficial messaging that aligns with generic category norms rather than claiming an exclusive, valuable problem domain.",
    distressFirstResponse: "Under the SOS framework, price sensitivity is always a symptom of weak positioning. When you introduce your product, how do you explain the specific cost of NOT choosing you to your primary buyer?",
    followUpQuestion: "Who is the customer segment that gets massive, irreplaceable value from your product, and how do you filter out low-value commoditizing prospects?",
    signalsToCapture: ["Ideal Buyer Persona", "Key Competitor Name", "Core Value Prop", "Average Deal Size"],
    crmFields: ["Company", "Contact", "Category Definition", "Deal Size", "Competitive Win Rate"],
    recommendedService: "Strategic Category Positioning and Offer Architecture",
    humanHandoffTrigger: "Enterprise repositioning briefs, pricing model overhauls, or executive GTM workshops.",
    conversationGoal: "Pivot from feature descriptions to exclusive problem ownership, show how to frame price as an investment, and recommend strategic messaging pillars.",
    tags: ["positioning", "messaging", "strategy"]
  },
  {
    id: "007",
    category: "CRM & Sales",
    industry: "Professional Services & Manufacturing",
    persona: "Sales Head",
    businessStage: "Growth",
    userTriggers: [
      "losing leads",
      "leads fall through the cracks",
      "sales team doesn't update",
      "broken crm",
      "hubspot setup",
      "crm tracking",
      "no follow-up",
      "pipeline leakage"
    ],
    hiddenPainPoint: "Substantial revenue leak due to undisciplined pipelines and broken operational handoffs.",
    likelyRootCause: "Suboptimal CRM process setup, missing triggers, or overly complex CRM configurations that reps bypass.",
    distressFirstResponse: "Prescribing CRM software changes won't fix behavioral gaps. Before looking at tools, could you walk me through your sales process: how many hours pass between a lead submitting a form and a live sales rep initiating a personal touch?",
    followUpQuestion: "Do you have automated lead routing and sequence reminders, or is your sales team expected to manage follow-up intervals manually?",
    signalsToCapture: ["Current CRM", "Sales Team Size", "Lead Response Time", "Deal Closure %"],
    crmFields: ["Company", "Contact", "CRM Platform Used", "Sales Cycle Duration", "Rep Adoption Rate"],
    recommendedService: "HubSpot / CRM Pipeline Optimization & Sales Enablement",
    humanHandoffTrigger: "CRM implementation consulting, enterprise workflow design, or API custom development.",
    conversationGoal: "Expose hidden revenue leaks in lead response delays, simplify pipeline stages, and propose a clean, frictionless automation layout.",
    tags: ["crm", "sales", "hubspot", "pipeline"]
  },
  {
    id: "008",
    category: "Email Marketing",
    industry: "D2C",
    persona: "Marketing Manager",
    businessStage: "Growth",
    userTriggers: [
      "nobody opens our emails",
      "low open rates",
      "emails go to spam",
      "email marketing",
      "newsletter not converting",
      "poor segmentation",
      "klaviyo setup"
    ],
    hiddenPainPoint: "Erosion of primary organic zero-CAC communication channel viability.",
    likelyRootCause: "Poor domain authentication setup (DKIM/DMARC), list fatigue from non-segmented blasting, or dry text templates lacking clear CTA layouts.",
    distressFirstResponse: "Thanks for sharing that. Before advising on copy changes, let's check your system health. What are your current open rates, and have you verified if your email sending domain has passed complete SPF, DKIM, and DMARC checks?",
    followUpQuestion: "Are you segmenting your list by active engagement behaviors, or are you running a single broadcast style across all email addresses?",
    signalsToCapture: ["Email ESP", "List Size", "Average Open Rate %", "Spam Status"],
    crmFields: ["Company", "Contact", "ESP Platform", "Email List Health", "Spam Risk Level"],
    recommendedService: "Klaviyo/ESP Revenue Recovery and Deliverability System",
    humanHandoffTrigger: "Email deliverability repair projects, complete flow architecture builds, or custom copy sprints.",
    conversationGoal: "Verify domain authentication parameters, highlight the value of behavioral segmentation, and outline an automated customer lifecycle system.",
    tags: ["email", "deliverability", "klaviyo", "automation"]
  },
  {
    id: "009",
    category: "LinkedIn",
    industry: "Agency",
    persona: "Founder",
    businessStage: "Early",
    userTriggers: [
      "linkedin isn't generating business",
      "linkedin isn't generating conversations",
      "linkedin personal brand",
      "linkedin content",
      "personal branding",
      "profile optimization"
    ],
    hiddenPainPoint: "Ineffective personal positioning resulting in low inbound lead flow.",
    likelyRootCause: "Inconsistent posting, overly promotional copy, and lack of a structured client-triage funnel inside the profile.",
    distressFirstResponse: "Under SCOS guidelines, your profile is not an online resume—it is a landing page. When a highly qualified buyer lands on your profile, is it immediately obvious what specific business roadblock you clear, and what physical next action they should take?",
    followUpQuestion: "What is your main goal on LinkedIn right now? Is it building general audience size, or converting specific high-ticket B2B accounts?",
    signalsToCapture: ["Target Industry", "Average Ticket Size", "Profile URL", "Weekly Posting Frequency"],
    crmFields: ["Company", "Contact", "LinkedIn Profile URL", "Target ACV", "Outreach Maturity"],
    recommendedService: "Founder LinkedIn Authority Funnel Setup",
    humanHandoffTrigger: "Content creation retainer requests, ghostwriting briefs, or complete personal branding packages.",
    conversationGoal: "Audit the profile for clear commercial value, establish consistent content frameworks, and create a high-triage profile funnel layout.",
    tags: ["linkedin", "personal-brand", "B2B-outreach"]
  },
  {
    id: "010",
    category: "AI & Automation",
    industry: "Manufacturing & B2B",
    persona: "CEO",
    businessStage: "Scale",
    userTriggers: [
      "how can ai help us",
      "where should we start with ai",
      "ai consulting",
      "ai automation",
      "ai strategy",
      "reduce delivery time",
      "team wastes hours",
      "manual workflows"
    ],
    hiddenPainPoint: "Substantial operational inefficiency causing delayed project timelines and bloated overhead cost margins.",
    likelyRootCause: "Failure to map manual workflows before automating, resulting in fragmented tools that increase organizational friction.",
    distressFirstResponse: "Before we talk about AI models or neural nets, we must map the friction. What is the single most manual, repetitive workflow in your business today that consumes over 10 hours of team labor every single week?",
    followUpQuestion: "Are you looking to apply AI to internal operational tasks (e.g. data routing, CRM updates) or customer-facing touchpoints (e.g. live support triage)?",
    signalsToCapture: ["Core Manual Workflow", "Team Hours Consumed", "Current Software Stack", "AI Budget"],
    crmFields: ["Company", "Contact", "Current Overhead Constraints", "Tech Stack Complexity", "AI Priority Area"],
    recommendedService: "SCOS AI Integration & Workflow Automation",
    humanHandoffTrigger: "Custom AI API builds, multi-system integration planning, or custom software architecture design.",
    conversationGoal: "Expose manual workflow inefficiencies, establish a solid automation roadmap, and introduce clean, structured AI integration principles.",
    tags: ["ai", "automation", "efficiency"]
  }
];

export function queryConversationLibrary(query: string): ConversationScenario | null {
  const lowerQuery = query.toLowerCase().trim();
  
  let bestScenario: ConversationScenario | null = null;
  let highestScore = 0;

  CONVERSATION_LIBRARY.forEach((scen) => {
    let score = 0;

    // Search Category and Tags
    if (lowerQuery.includes(scen.category.toLowerCase())) {
      score += 20;
    }

    scen.tags.forEach(tag => {
      if (lowerQuery.includes(tag.toLowerCase())) {
        score += 15;
      }
    });

    // Check Trigger Phrases
    scen.userTriggers.forEach((trigger) => {
      if (lowerQuery.includes(trigger.toLowerCase())) {
        score += 25;
      }
    });

    if (score > highestScore) {
      highestScore = score;
      bestScenario = scen;
    }
  });

  // Minimum threshold score
  return highestScore >= 10 ? bestScenario : null;
}
