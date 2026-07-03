import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Printer, 
  Save, 
  LogOut, 
  ArrowLeft, 
  Lock, 
  User, 
  FileText, 
  Check, 
  RotateCcw, 
  FilePlus, 
  AlertCircle, 
  Calendar, 
  Building,
  Mail,
  MapPin,
  DollarSign
} from 'lucide-react';
import { Quotation, QuotationItem } from '../types';

const INITIAL_SEED_QUOTATIONS: Quotation[] = [
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

const generateMockupQuotation = (prompt: string, details: any): Quotation => {
  const words = prompt.toLowerCase();
  const items: QuotationItem[] = [];
  
  if (words.includes('brand') || words.includes('identity') || words.includes('logo') || words.includes('visual')) {
    items.push({
      id: `qi-mock-${Date.now()}-1`,
      name: 'Custom Visual Identity & Branding Reconstruction',
      description: 'Emergency asset package: complete visual system, custom logo marks, and type treatment.',
      quantity: 1,
      price: 5200
    });
  }
  if (words.includes('website') || words.includes('dev') || words.includes('code') || words.includes('app') || words.includes('tech')) {
    items.push({
      id: `qi-mock-${Date.now()}-2`,
      name: 'Full-Stack Rapid Web Deployment',
      description: 'Production-ready React application deployment, speed optimizations, and SEO triage.',
      quantity: 1,
      price: 6800
    });
  }
  if (words.includes('support') || words.includes('retainer') || words.includes('contract')) {
    items.push({
      id: `qi-mock-${Date.now()}-3`,
      name: 'Emergency Response Retainer Service',
      description: 'Dedicated senior developer response line and system monitoring (24/7/365 coverage).',
      quantity: 3,
      price: 1500
    });
  }
  if (words.includes('consulting') || words.includes('audit') || words.includes('strategy') || words.includes('analysis')) {
    items.push({
      id: `qi-mock-${Date.now()}-4`,
      name: 'Strategic Position Diagnosis & Crisis Audit',
      description: 'Competitor mapping, brand friction report, and high-impact deployment blueprint.',
      quantity: 1,
      price: 3200
    });
  }

  if (items.length === 0) {
    items.push({
      id: `qi-mock-${Date.now()}-default-1`,
      name: 'SOS Custom Creative Response Package',
      description: `Tailored intervention package matching requested criteria: "${prompt.substring(0, 60)}..."`,
      quantity: 1,
      price: 4500
    });
    items.push({
      id: `qi-mock-${Date.now()}-default-2`,
      name: 'Tactical Deployment Support Retainer',
      description: 'General engineering dispatch and asset deployment support.',
      quantity: 1,
      price: 2500
    });
  }

  const dateNow = new Date();
  const dateStr = dateNow.toISOString().split('T')[0];
  const expDate = new Date();
  expDate.setDate(dateNow.getDate() + 30);
  const expDateStr = expDate.toISOString().split('T')[0];

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const taxRate = details?.taxRate !== undefined ? Number(details.taxRate) : 18;
  const taxAmount = Math.round(subtotal * (taxRate / 100));
  const total = subtotal + taxAmount;

  return {
    id: `q-mock-${Date.now()}`,
    quotationNo: `QT-${dateNow.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    clientName: details?.clientName || 'Apex Flow Solutions Inc.',
    clientEmail: details?.clientEmail || 'billing@apexsolutions.io',
    clientAddress: details?.clientAddress || '123 Enterprise Parkway, Suite 10, CA',
    date: dateStr,
    expiryDate: expDateStr,
    items,
    subtotal,
    taxRate,
    taxAmount,
    total,
    currency: details?.currency || 'USD',
    notes: 'Custom smart quotation generated via backup local client algorithm.',
    terms: '50% upfront retainer deposit. 50% upon complete delivery of assets.',
    status: 'draft'
  };
};

interface QuotationDashboardProps {
  onBackToMain: () => void;
}

export default function QuotationDashboard({ onBackToMain }: QuotationDashboardProps) {
  // Authentication State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('sos_sales_logged_in') === 'true';
  });
  const [loginError, setLoginError] = useState('');

  // Quotations List and Selection
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(false);

  // Generation Prompt State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  // Notification State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Quick Client Details for generator suggestion
  const [prefName, setPrefName] = useState('');
  const [prefEmail, setPrefEmail] = useState('');
  const [prefAddress, setPrefAddress] = useState('');
  const [prefTaxRate, setPrefTaxRate] = useState(18);
  const [prefCurrency, setPrefCurrency] = useState('USD');

  // Load Saved Quotations on mount or login
  useEffect(() => {
    if (isLoggedIn) {
      fetchQuotations();
    }
  }, [isLoggedIn]);

  // Toast auto-clear
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
  };

  const getLocalQuotations = (): Quotation[] => {
    try {
      const cached = localStorage.getItem('sos_local_quotations');
      if (cached) {
        return JSON.parse(cached);
      }
      localStorage.setItem('sos_local_quotations', JSON.stringify(INITIAL_SEED_QUOTATIONS));
      return INITIAL_SEED_QUOTATIONS;
    } catch (e) {
      return INITIAL_SEED_QUOTATIONS;
    }
  };

  const saveLocalQuotations = (data: Quotation[]) => {
    try {
      localStorage.setItem('sos_local_quotations', JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchQuotations = async () => {
    setIsLoadingList(true);
    // Load local storage first so we always have the cached data immediately
    const localData = getLocalQuotations();
    setQuotations(localData);
    if (localData.length > 0 && !selectedQuote) {
      setSelectedQuote(localData[0]);
    }

    try {
      const res = await fetch('/api/quotations');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setQuotations(data);
          saveLocalQuotations(data);
          // Only auto select if nothing is selected or selected is not in the list
          if (!selectedQuote || !data.some(q => q.id === selectedQuote.id)) {
            setSelectedQuote(data[0]);
          }
        }
      }
    } catch (err) {
      console.warn('Backend server connection not found. Operating in local offline-first mode.');
    } finally {
      setIsLoadingList(false);
    }
  };

  // Handle Admin Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();
    if (
      (cleanUser === 'admin' && cleanPass === 'admin123') ||
      (cleanUser === 'admin' && cleanPass.toLowerCase() === 'admin123')
    ) {
      localStorage.setItem('sos_sales_logged_in', 'true');
      setIsLoggedIn(true);
      setLoginError('');
      showToast('Logged in as Senior Creative Dispatcher');
    } else {
      setLoginError('Invalid transmission codes. Hint: admin / admin123');
    }
  };

  // One-click demo/admin bypass login
  const handleInstantLogin = () => {
    setUsername('admin');
    setPassword('admin123');
    localStorage.setItem('sos_sales_logged_in', 'true');
    setIsLoggedIn(true);
    setLoginError('');
    showToast('Logged in successfully via bypass protocol');
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('sos_sales_logged_in');
    setIsLoggedIn(false);
    setSelectedQuote(null);
    showToast('Securely logged out');
  };

  // Create a blank New Draft Quotation
  const handleCreateNewDraft = () => {
    const dateNow = new Date();
    const dateStr = dateNow.toISOString().split('T')[0];
    const expDate = new Date();
    expDate.setDate(dateNow.getDate() + 30);
    const expDateStr = expDate.toISOString().split('T')[0];

    const draft: Quotation = {
      id: `q-draft-${Date.now()}`,
      quotationNo: `QT-${dateNow.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: 'New Client Inc.',
      clientEmail: 'billing@client.com',
      clientAddress: '100 Business Parkway, Suite A, NY 10001',
      date: dateStr,
      expiryDate: expDateStr,
      items: [
        {
          id: `qi-draft-${Date.now()}-1`,
          name: 'Emergency Branding Triage',
          description: 'Initial fast-track analysis and competitive audits under brand pressure.',
          quantity: 1,
          price: 2500
        }
      ],
      subtotal: 2500,
      taxRate: 18,
      taxAmount: 450,
      total: 2950,
      currency: 'USD',
      terms: '50% deposit required to initiate. Balance upon completion.',
      notes: 'Priority queue for corporate brand stabilization.',
      status: 'draft'
    };

    setSelectedQuote(draft);
    showToast('Created new quotation draft');
  };

  // Delete Quotation
  const handleDeleteQuote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to permanently delete this quotation from ledger?')) {
      return;
    }

    // Update local storage first
    const currentList = getLocalQuotations();
    const filtered = currentList.filter(q => q.id !== id);
    saveLocalQuotations(filtered);
    setQuotations(filtered);
    if (selectedQuote?.id === id) {
      setSelectedQuote(filtered.length > 0 ? filtered[0] : null);
    }
    showToast('Quotation successfully deleted');

    // Sync with backend asynchronously
    try {
      await fetch(`/api/quotations/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend sync failed on deletion:', err);
    }
  };

  // Generate Quotation with AI (Gemini)
  const handleGenerateQuoteWithAI = async () => {
    if (!aiPrompt.trim()) {
      setGenError('Please provide a description prompt for the quotation.');
      return;
    }

    setIsGenerating(true);
    setGenError('');

    const clientDetails = {
      clientName: prefName || 'Apex Flow Solutions Inc.',
      clientEmail: prefEmail || 'billing@apexsolutions.io',
      clientAddress: prefAddress || '123 Enterprise Parkway, Suite 10, CA',
      taxRate: Number(prefTaxRate),
      currency: prefCurrency
    };

    try {
      const payload = {
        prompt: aiPrompt,
        clientDetails
      };

      const res = await fetch('/api/quotations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Server offline or unavailable');
      }

      const generatedQuote: Quotation = await res.json();
      setSelectedQuote(generatedQuote);
      
      // Save locally to make it permanent immediately
      const currentList = getLocalQuotations();
      currentList.unshift(generatedQuote);
      saveLocalQuotations(currentList);
      setQuotations(currentList);

      showToast('AI quotation generated successfully!');
      setAiPrompt(''); // Clear prompt
    } catch (err: any) {
      console.warn('AI generation failed, using local smart template generator...', err);
      // Client-side local AI smart fallback!
      const mockQuote = generateMockupQuotation(aiPrompt, clientDetails);
      setSelectedQuote(mockQuote);
      
      // Save locally to make it permanent immediately
      const currentList = getLocalQuotations();
      currentList.unshift(mockQuote);
      saveLocalQuotations(currentList);
      setQuotations(currentList);

      showToast('AI offline: generated via local smart model!', 'success');
      setAiPrompt('');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save Quotation to database
  const handleSaveQuotation = async () => {
    if (!selectedQuote) return;

    // 1. Save locally first
    const currentList = getLocalQuotations();
    const idx = currentList.findIndex(q => q.id === selectedQuote.id);
    if (idx > -1) {
      currentList[idx] = selectedQuote;
    } else {
      currentList.unshift(selectedQuote);
    }
    saveLocalQuotations(currentList);
    setQuotations(currentList);

    // 2. Attempt sync with backend
    try {
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedQuote)
      });

      if (res.ok) {
        showToast(`Quotation ${selectedQuote.quotationNo} synchronized with server!`);
      } else {
        showToast(`Saved to local browser storage`, 'success');
      }
    } catch (err) {
      console.warn('Backend sync failed, stored locally:', err);
      showToast(`Saved to local browser storage`, 'success');
    }
  };

  // Print Quotation
  const handlePrint = () => {
    window.print();
  };

  // Live edit quotation fields
  const updateQuoteField = (field: keyof Quotation, value: any) => {
    if (!selectedQuote) return;
    const updated = { ...selectedQuote, [field]: value };
    recalculateTotals(updated);
  };

  // Live edit item fields
  const updateItemField = (itemId: string, field: keyof QuotationItem, value: any) => {
    if (!selectedQuote) return;
    const updatedItems = selectedQuote.items.map(item => {
      if (item.id === itemId) {
        const newVal = field === 'price' || field === 'quantity' ? Number(value) : value;
        return { ...item, [field]: newVal };
      }
      return item;
    });

    const updated = { ...selectedQuote, items: updatedItems };
    recalculateTotals(updated);
  };

  // Add blank line item
  const handleAddLineItem = () => {
    if (!selectedQuote) return;
    const newItem: QuotationItem = {
      id: `qi-custom-${Date.now()}`,
      name: 'Custom Consultation Service',
      description: 'Detail of professional creative consulting scope.',
      quantity: 1,
      price: 1500
    };

    const updated = {
      ...selectedQuote,
      items: [...selectedQuote.items, newItem]
    };
    recalculateTotals(updated);
    showToast('Line item added');
  };

  // Delete line item
  const handleDeleteLineItem = (itemId: string) => {
    if (!selectedQuote) return;
    if (selectedQuote.items.length <= 1) {
      showToast('Quotation must contain at least 1 line item', 'error');
      return;
    }
    const filteredItems = selectedQuote.items.filter(item => item.id !== itemId);
    const updated = { ...selectedQuote, items: filteredItems };
    recalculateTotals(updated);
    showToast('Line item removed');
  };

  // Recalculate invoice sums
  const recalculateTotals = (quote: Quotation) => {
    const subtotal = quote.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const taxAmount = Math.round(subtotal * (quote.taxRate / 100));
    const total = subtotal + taxAmount;

    setSelectedQuote({
      ...quote,
      subtotal,
      taxAmount,
      total
    });
  };

  // Get symbol of currency
  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'USD': return '$';
      case 'INR': return '₹';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return curr;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-mono selection:bg-[#FF3B30] selection:text-white">
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 p-4 border flex items-center gap-3 shadow-2xl transition-all duration-300 animate-bounce ${
          toastMessage.type === 'error' 
            ? 'bg-red-950/90 border-red-500 text-red-200' 
            : 'bg-neutral-900/95 border-emerald-500 text-emerald-200'
        }`}>
          {toastMessage.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-500" /> : <Check className="w-5 h-5 text-emerald-500" />}
          <span className="text-xs font-bold uppercase tracking-wider">{toastMessage.text}</span>
        </div>
      )}

      {/* HEADER CONTROLS (HIDDEN DURING PRINT) */}
      <header className="print:hidden sticky top-0 z-40 bg-[#0A0A0A] border-b border-neutral-900 px-4 py-3 md:px-8 flex justify-between items-center select-none shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBackToMain}
            className="flex items-center gap-2 px-3 py-1.5 border border-neutral-800 text-[11px] hover:bg-neutral-800 transition-colors uppercase font-bold text-neutral-400 hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            [BACK] TO TERMINAL
          </button>
          <div className="h-4 w-[1px] bg-neutral-850" />
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#FF3B30] rounded-full animate-pulse" />
            <span className="text-xs font-black tracking-widest text-[#FF3B30]">SOS CORE QUOTATION SYSTEM</span>
          </div>
        </div>

        {isLoggedIn && (
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-neutral-500 uppercase hidden sm:inline">
              ⚡ dispatcher mode: active
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-red-900 text-[11px] hover:bg-red-950 text-red-400 hover:text-red-200 transition-colors uppercase font-bold"
            >
              <LogOut className="w-3.5 h-3.5" />
              LOGOUT
            </button>
          </div>
        )}
      </header>

      {/* AUTHENTICATION VIEW */}
      {!isLoggedIn ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 py-16 bg-[#080808] relative overflow-hidden">
          {/* Decorative scanline overlay */}
          <div className="absolute inset-0 bg-scanlines opacity-10 pointer-events-none" />
          
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-8 shadow-[0_10px_50px_rgba(0,0,0,0.8)] relative z-10 rounded-none">
            <div className="text-center mb-8">
              <div className="w-12 h-12 border-2 border-[#FF3B30] rotate-45 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Lock className="w-5 h-5 text-[#FF3B30] -rotate-45" />
              </div>
              <h2 className="text-lg font-black tracking-widest uppercase text-white">SALES DISPATCH ENTRY</h2>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Unlock direct secure portal to manage, generate, and edit professional branding quotations for your team.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase text-neutral-400 block tracking-widest font-bold mb-1.5">
                  OPERATOR USERNAME
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full bg-neutral-950 border border-neutral-800 px-10 py-2 text-xs focus:border-[#FF3B30] focus:outline-none transition-colors uppercase text-white rounded-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase text-neutral-400 block tracking-widest font-bold mb-1.5">
                  DISPATCH PASSCODE
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-neutral-950 border border-neutral-800 px-10 py-2 text-xs focus:border-[#FF3B30] focus:outline-none transition-colors text-white rounded-none"
                  />
                </div>
              </div>

              {loginError && (
                <div className="bg-red-950/50 border border-red-900 p-3 text-red-400 text-xs flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#FF3B30] hover:bg-red-700 transition-colors text-xs font-black tracking-widest text-white uppercase cursor-pointer"
                >
                  AUTHORIZE TERMINAL
                </button>
                <button
                  type="button"
                  onClick={handleInstantLogin}
                  className="px-3 py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-750 hover:border-neutral-500 text-[10px] font-black tracking-widest text-emerald-400 hover:text-emerald-300 uppercase cursor-pointer transition-colors"
                  title="Instant Demo / Sales Bypass"
                >
                  BYPASS
                </button>
              </div>
            </form>

            <div className="mt-6 border-t border-neutral-850 pt-4 text-center">
              <span className="text-[10px] text-neutral-500 block">DEFAULT TEAM CREDENTIALS:</span>
              <code className="text-[10px] text-[#FF3B30] mt-1 block">Username: admin | Passcode: admin123</code>
            </div>
          </div>
        </div>
      ) : (
        /* DISPATCHED SALES WORKSPACE */
        <div className="flex-1 flex flex-col lg:flex-row h-full">
          
          {/* LEFT SIDEBAR: SALES CONFIG & LEDGER (HIDDEN DURING PRINT) */}
          <aside className="print:hidden w-full lg:w-96 bg-[#090909] border-r border-neutral-900 flex flex-col shrink-0">
            
            {/* ACTION TRIGGERS */}
            <div className="p-4 border-b border-neutral-900 space-y-2">
              <button
                onClick={handleCreateNewDraft}
                className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-neutral-800 hover:border-white text-xs font-bold text-white hover:bg-neutral-900 transition-colors uppercase"
              >
                <FilePlus className="w-4 h-4 text-[#FF3B30]" />
                Create Blank Draft
              </button>
            </div>

            {/* AI GENERATOR PANEL */}
            <div className="p-4 border-b border-neutral-900 bg-neutral-950/60">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#FF3B30]" />
                <span className="text-xs font-black tracking-wider uppercase text-white">AI QUOTATION CREATOR</span>
              </div>
              <p className="text-[11px] text-neutral-500 mb-3 leading-relaxed">
                Input your client's business crisis or needs. The AI will parse details and auto-draft a professional, line-by-line corporate proposal.
              </p>

              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Example: Need urgent brand identity, logos, support contract for Apex Tech. Project budget is 12,000 USD."
                rows={4}
                className="w-full bg-neutral-950 border border-neutral-850 p-2 text-xs text-neutral-300 placeholder-neutral-600 focus:border-[#FF3B30] focus:outline-none mb-3 resize-none"
              />

              {/* COLLAPSIBLE ADVANCED AI PRESETS */}
              <div className="mb-3 space-y-2 bg-neutral-900 p-2.5 border border-neutral-850">
                <div className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold">CLIENT DEFAULTS:</div>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    value={prefName}
                    onChange={(e) => setPrefName(e.target.value)}
                    placeholder="Client Name"
                    className="bg-neutral-950 border border-neutral-800 p-1 text-[10px] text-neutral-300 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={prefEmail}
                    onChange={(e) => setPrefEmail(e.target.value)}
                    placeholder="Client Email"
                    className="bg-neutral-950 border border-neutral-800 p-1 text-[10px] text-neutral-300 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <select
                    value={prefCurrency}
                    onChange={(e) => setPrefCurrency(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 p-1 text-[10px] text-neutral-300 focus:outline-none cursor-pointer"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                  <input
                    type="number"
                    value={prefTaxRate}
                    onChange={(e) => setPrefTaxRate(Number(e.target.value))}
                    placeholder="Tax %"
                    className="bg-neutral-950 border border-neutral-800 p-1 text-[10px] text-neutral-300 focus:outline-none [appearance:textfield]"
                  />
                  <span className="text-[10px] text-neutral-500 self-center text-center uppercase font-bold">TAX %</span>
                </div>
              </div>

              {genError && (
                <div className="text-[11px] text-red-400 bg-red-950/20 border border-red-900/60 p-2 mb-3">
                  {genError}
                </div>
              )}

              <button
                onClick={handleGenerateQuoteWithAI}
                disabled={isGenerating}
                className="w-full py-2 bg-[#FF3B30] hover:bg-red-700 transition-colors text-xs font-black tracking-widest text-white uppercase flex items-center justify-center gap-2 disabled:bg-neutral-850 disabled:text-neutral-500"
              >
                {isGenerating ? (
                  <>
                    <span className="w-3 h-3 border-2 border-neutral-400 border-t-white rounded-full animate-spin" />
                    DECODING...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    GENERATE AI PROPOSAL
                  </>
                )}
              </button>
            </div>

            {/* LEDGER ARCHIVES */}
            <div className="flex-1 overflow-y-auto terminal-scrollbar flex flex-col">
              <div className="p-4 border-b border-neutral-900 bg-neutral-950/30 flex justify-between items-center shrink-0">
                <span className="text-xs font-black tracking-wider uppercase text-neutral-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  SAVED QUOTATIONS ({quotations.length})
                </span>
                <button 
                  onClick={fetchQuotations}
                  className="text-[10px] text-[#FF3B30] hover:underline"
                >
                  REFRESH
                </button>
              </div>

              {isLoadingList ? (
                <div className="p-8 text-center text-xs text-neutral-600 uppercase">
                  📡 Reading local secure logs...
                </div>
              ) : quotations.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-600 uppercase">
                  No registered corporate drafts.
                </div>
              ) : (
                <div className="divide-y divide-neutral-900">
                  {quotations.map((quote) => {
                    const isSelected = selectedQuote?.id === quote.id;
                    return (
                      <div
                        key={quote.id}
                        onClick={() => setSelectedQuote(quote)}
                        className={`p-3.5 cursor-pointer hover:bg-neutral-900 transition-colors relative flex flex-col gap-1 select-none ${
                          isSelected ? 'bg-neutral-900 border-l-2 border-[#FF3B30]' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className={`text-xs font-black tracking-tight ${isSelected ? 'text-[#FF3B30]' : 'text-neutral-200'}`}>
                            {quote.clientName}
                          </span>
                          <span className="text-[10px] text-neutral-500">
                            {quote.date}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-neutral-400 font-mono">
                            {quote.quotationNo}
                          </span>
                          <span className="font-bold text-white">
                            {getCurrencySymbol(quote.currency)}{quote.total.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] mt-1">
                          <span className={`px-1.5 py-0.5 font-bold uppercase text-[9px] ${
                            quote.status === 'paid' ? 'bg-emerald-950 text-emerald-400' :
                            quote.status === 'sent' ? 'bg-indigo-950 text-indigo-400' :
                            'bg-neutral-850 text-neutral-400'
                          }`}>
                            {quote.status}
                          </span>
                          <button
                            onClick={(e) => handleDeleteQuote(quote.id, e)}
                            className="p-1 hover:text-[#FF3B30] text-neutral-600 transition-colors"
                            title="Delete Quote"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          {/* MAIN AREA: INTERACTIVE SHEET EDITOR */}
          <main className="flex-1 bg-neutral-900/60 p-4 md:p-8 overflow-y-auto terminal-scrollbar relative flex flex-col items-center">
            
            {/* INSTRUCTIONS & WORKSPACE ACTION HEADER (HIDDEN DURING PRINT) */}
            {selectedQuote && (
              <div className="print:hidden w-full max-w-4xl bg-[#090909] border border-neutral-850 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
                <div>
                  <h3 className="text-xs font-bold uppercase text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                    LIVE QUOTATION STUDIO: {selectedQuote.quotationNo}
                  </h3>
                  <p className="text-[11px] text-neutral-500 leading-relaxed mt-1">
                    Directly live-edit information, add/delete line items, update descriptions on the sheet. Print is auto-formatted for elegant clean A4 presentation.
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={handleSaveQuotation}
                    className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 text-[11px] hover:bg-neutral-700 text-neutral-100 transition-colors uppercase font-bold border border-neutral-700"
                  >
                    <Save className="w-3.5 h-3.5 text-emerald-500" />
                    SAVE DATABASE
                  </button>

                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#FF3B30] text-[11px] hover:bg-red-700 text-white transition-colors uppercase font-bold"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    PRINT / SAVE PDF
                  </button>
                </div>
              </div>
            )}

            {/* WHITE BACKGROUND SHEET VIEW */}
            {selectedQuote ? (
              <div 
                id="printable-quote-sheet"
                className="w-full max-w-4xl bg-white text-neutral-900 p-8 sm:p-12 shadow-[0_15px_60px_rgba(0,0,0,0.5)] border border-neutral-300 rounded-none relative leading-relaxed"
                style={{ contentVisibility: 'auto' }}
              >
                
                {/* TOP HEADER: DECORATIVE CORNER / LOGO */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b-2 border-neutral-900 pb-8">
                  {/* Agency Branding */}
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 bg-[#FF3B30]" />
                      <span className="text-lg font-black tracking-widest text-neutral-900 font-mono">SOS AGENCY</span>
                    </div>
                    <p className="text-xs text-neutral-500 font-mono mt-1.5 uppercase tracking-wider">
                      RECONSTRUCTION & POSITION DISPATCH
                    </p>
                    <p className="text-xs text-neutral-500 mt-2 font-sans">
                      SOS Agency Headquarters, Tower 10, Suite 404<br/>
                      contact@sosagency.in | +91 - 9099906631
                    </p>
                  </div>

                  {/* Document Title / Meta */}
                  <div className="text-right md:text-right w-full md:w-auto">
                    <h1 className="text-2xl font-black tracking-tight uppercase font-mono text-neutral-900">
                      QUOTATION
                    </h1>
                    
                    {/* Live Editable Quotation details */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-4 font-mono text-xs text-left md:text-right">
                      <span className="text-neutral-500 font-sans">QUOTE NO:</span>
                      <input 
                        type="text" 
                        value={selectedQuote.quotationNo}
                        onChange={(e) => updateQuoteField('quotationNo', e.target.value)}
                        className="font-bold text-neutral-900 bg-neutral-100/50 hover:bg-neutral-100 focus:bg-neutral-100 border-none px-1 text-right focus:outline-none"
                      />

                      <span className="text-neutral-500 font-sans">DATE:</span>
                      <input 
                        type="date" 
                        value={selectedQuote.date}
                        onChange={(e) => updateQuoteField('date', e.target.value)}
                        className="text-neutral-900 bg-neutral-100/50 hover:bg-neutral-100 focus:bg-neutral-100 border-none px-1 text-right focus:outline-none"
                      />

                      <span className="text-neutral-500 font-sans">VALID UNTIL:</span>
                      <input 
                        type="date" 
                        value={selectedQuote.expiryDate}
                        onChange={(e) => updateQuoteField('expiryDate', e.target.value)}
                        className="text-neutral-900 bg-neutral-100/50 hover:bg-neutral-100 focus:bg-neutral-100 border-none px-1 text-right focus:outline-none"
                      />

                      <span className="text-neutral-500 font-sans">STATUS:</span>
                      <select
                        value={selectedQuote.status}
                        onChange={(e) => updateQuoteField('status', e.target.value)}
                        className="font-bold text-neutral-950 bg-neutral-100/50 hover:bg-neutral-100 focus:bg-neutral-100 border-none px-1 py-0 text-right focus:outline-none cursor-pointer"
                      >
                        <option value="draft">DRAFT</option>
                        <option value="sent">SENT</option>
                        <option value="paid">PAID</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* TWO COLUMN INVOICE INFO: BILL TO & INFO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8 font-sans">
                  {/* CLIENT INFO BLOCK */}
                  <div className="bg-neutral-50 p-4 border border-neutral-200">
                    <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 block tracking-wider mb-2.5">
                      CLIENT / RECIPIENT
                    </span>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <input
                          type="text"
                          value={selectedQuote.clientName}
                          onChange={(e) => updateQuoteField('clientName', e.target.value)}
                          className="font-bold text-sm text-neutral-900 bg-transparent hover:bg-neutral-150 focus:bg-white border-b border-transparent focus:border-neutral-350 focus:outline-none w-full"
                          placeholder="Client Company Name"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <input
                          type="email"
                          value={selectedQuote.clientEmail}
                          onChange={(e) => updateQuoteField('clientEmail', e.target.value)}
                          className="text-xs text-neutral-600 bg-transparent hover:bg-neutral-150 focus:bg-white border-b border-transparent focus:border-neutral-350 focus:outline-none w-full"
                          placeholder="client@billing.com"
                        />
                      </div>
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-1" />
                        <textarea
                          value={selectedQuote.clientAddress}
                          onChange={(e) => updateQuoteField('clientAddress', e.target.value)}
                          rows={2}
                          className="text-xs text-neutral-600 bg-transparent hover:bg-neutral-150 focus:bg-white border-b border-transparent focus:border-neutral-350 focus:outline-none w-full resize-none"
                          placeholder="Physical Address"
                        />
                      </div>
                    </div>
                  </div>

                  {/* AGENCY STATEMENT BLOCK */}
                  <div className="border border-neutral-200 p-4 flex flex-col justify-between bg-neutral-50">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 block tracking-wider mb-2.5">
                        DISPATCH DETAILS
                      </span>
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        This quotation represents specialized corporate restoration strategies. Services are initialized immediately upon signature of dispatch protocols and clearance of standard deposit.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 text-xs font-mono mt-4 pt-2 border-t border-neutral-200">
                      <span className="text-neutral-500">CURRENCY:</span>
                      <select
                        value={selectedQuote.currency}
                        onChange={(e) => updateQuoteField('currency', e.target.value)}
                        className="font-bold text-neutral-900 bg-transparent focus:outline-none text-right cursor-pointer"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="INR">INR (₹)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* LINE ITEMS TABLE */}
                <div className="my-8 overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs border-collapse">
                    <thead>
                      <tr className="border-b-2 border-neutral-900 font-mono font-bold text-neutral-500 text-[10px] uppercase tracking-wider">
                        <th className="py-2.5 px-1 w-[40%]">SERVICE deliverables</th>
                        <th className="py-2.5 px-1 w-[10%] text-center">QTY</th>
                        <th className="py-2.5 px-1 w-[20%] text-right">UNIT PRICE</th>
                        <th className="py-2.5 px-1 w-[20%] text-right">TOTAL</th>
                        <th className="py-2.5 px-1 w-[10%] text-center print:hidden">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {selectedQuote.items.map((item) => (
                        <tr key={item.id} className="align-top group">
                          {/* Deliverable details */}
                          <td className="py-3 px-1">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => updateItemField(item.id, 'name', e.target.value)}
                              className="font-bold text-neutral-900 bg-transparent hover:bg-neutral-100 focus:bg-neutral-150 border-b border-transparent focus:border-neutral-300 focus:outline-none w-full text-xs"
                              placeholder="Service Title"
                            />
                            <textarea
                              value={item.description}
                              onChange={(e) => updateItemField(item.id, 'description', e.target.value)}
                              rows={2}
                              className="text-xs text-neutral-500 mt-1 bg-transparent hover:bg-neutral-100 focus:bg-neutral-150 border-b border-transparent focus:border-neutral-300 focus:outline-none w-full resize-none leading-relaxed"
                              placeholder="Service Deliverables Outline"
                            />
                          </td>

                          {/* Qty */}
                          <td className="py-3 px-1 text-center">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItemField(item.id, 'quantity', e.target.value)}
                              className="text-center font-mono font-bold text-neutral-900 bg-neutral-100 hover:bg-neutral-150 focus:bg-white border-none w-12 py-1 focus:outline-none"
                              min="1"
                            />
                          </td>

                          {/* Unit price */}
                          <td className="py-3 px-1 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <span className="text-neutral-400 font-mono">{getCurrencySymbol(selectedQuote.currency)}</span>
                              <input
                                type="number"
                                value={item.price}
                                onChange={(e) => updateItemField(item.id, 'price', e.target.value)}
                                className="text-right font-mono font-bold text-neutral-900 bg-neutral-100 hover:bg-neutral-150 focus:bg-white border-none w-20 py-1 focus:outline-none"
                                min="0"
                              />
                            </div>
                          </td>

                          {/* Total row */}
                          <td className="py-3 px-1 text-right font-mono font-bold text-neutral-900 text-sm">
                            {getCurrencySymbol(selectedQuote.currency)}{(item.price * item.quantity).toLocaleString()}
                          </td>

                          {/* Print hidden action */}
                          <td className="py-3 px-1 text-center print:hidden">
                            <button
                              onClick={() => handleDeleteLineItem(item.id)}
                              className="p-1 hover:text-[#FF3B30] text-neutral-300 transition-colors"
                              title="Delete Line Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ADD LINE ITEM BUTTON (HIDDEN DURING PRINT) */}
                <div className="print:hidden my-4">
                  <button
                    onClick={handleAddLineItem}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 hover:bg-neutral-100 text-[11px] text-neutral-700 transition-colors uppercase font-bold"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#FF3B30]" />
                    Add Proposal Line Item
                  </button>
                </div>

                {/* PRICING TOTALS SUMMARY & DISCLOSURES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t-2 border-neutral-900 pt-6">
                  
                  {/* Notes / Terms Block */}
                  <div className="text-xs space-y-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider mb-1">
                        CONTRACT NOTES:
                      </span>
                      <textarea
                        value={selectedQuote.notes}
                        onChange={(e) => updateQuoteField('notes', e.target.value)}
                        rows={2}
                        className="text-xs text-neutral-500 w-full bg-transparent hover:bg-neutral-100 focus:bg-neutral-150 border-b border-transparent focus:border-neutral-300 focus:outline-none resize-none leading-relaxed"
                        placeholder="Additional project details..."
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider mb-1">
                        PAYMENT TERMS & STIPULATIONS:
                      </span>
                      <textarea
                        value={selectedQuote.terms}
                        onChange={(e) => updateQuoteField('terms', e.target.value)}
                        rows={3}
                        className="text-xs text-neutral-500 w-full bg-transparent hover:bg-neutral-100 focus:bg-neutral-150 border-b border-transparent focus:border-neutral-300 focus:outline-none resize-none leading-relaxed"
                        placeholder="Payment terms..."
                      />
                    </div>
                  </div>

                  {/* Calculations Sheet */}
                  <div className="bg-neutral-50 p-4 border border-neutral-200 self-start">
                    <div className="space-y-2.5 font-mono text-xs">
                      <div className="flex justify-between text-neutral-600">
                        <span>SUBTOTAL:</span>
                        <span>{getCurrencySymbol(selectedQuote.currency)}{selectedQuote.subtotal.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-neutral-600">
                        <div className="flex items-center gap-1">
                          <span>TAX (</span>
                          <input 
                            type="number" 
                            value={selectedQuote.taxRate}
                            onChange={(e) => updateQuoteField('taxRate', Number(e.target.value))}
                            className="bg-neutral-100 hover:bg-neutral-150 focus:bg-white text-center font-bold text-neutral-900 border-none w-10 py-0.5 focus:outline-none text-xs"
                            min="0"
                          />
                          <span>%):</span>
                        </div>
                        <span>{getCurrencySymbol(selectedQuote.currency)}{selectedQuote.taxAmount.toLocaleString()}</span>
                      </div>

                      <div className="border-t border-neutral-200 my-2 pt-2 flex justify-between font-bold text-neutral-900 text-base">
                        <span>TOTAL AMOUNT:</span>
                        <span>{getCurrencySymbol(selectedQuote.currency)}{selectedQuote.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SIGNATURE SIGN-OFF BAR */}
                <div className="mt-16 pt-8 border-t border-neutral-200 grid grid-cols-2 gap-12 text-center text-xs font-sans">
                  <div>
                    <div className="h-10 border-b border-neutral-300 mx-auto w-[80%]" />
                    <span className="text-[10px] uppercase font-mono font-bold text-neutral-400 block tracking-wider mt-2">
                      SOS DISPATCH SIGN-OFF
                    </span>
                  </div>
                  <div>
                    <div className="h-10 border-b border-neutral-300 mx-auto w-[80%]" />
                    <span className="text-[10px] uppercase font-mono font-bold text-neutral-400 block tracking-wider mt-2">
                      CLIENT ACCEPTANCE SIGNATURE
                    </span>
                  </div>
                </div>

                {/* Footer credit */}
                <div className="text-center font-mono text-[9px] text-neutral-400 mt-12 tracking-widest uppercase">
                  SAVED SECURELY PROTOCOL. SOS AGENCY © 2026.
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-neutral-500 text-center uppercase">
                <FileText className="w-12 h-12 text-neutral-700 mb-3 animate-pulse" />
                Select or Generate a Quotation to Display on Studio Sheet
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
