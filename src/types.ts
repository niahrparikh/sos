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
