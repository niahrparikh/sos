export interface CaseFile {
  id: string;
  number: string;
  client: string;
  incident: string;
  responseTime: string;
  outcome: number; // percentage progress/strength
  outcomeText: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  client: string;
  role: string;
}

export interface ChatMessageData {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
  isBootSeq?: boolean;
}

export interface QuotationItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Quotation {
  id: string;
  quotationNo: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  date: string;
  expiryDate: string;
  items: QuotationItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  terms: string;
  notes: string;
  status: 'draft' | 'sent' | 'paid';
}
