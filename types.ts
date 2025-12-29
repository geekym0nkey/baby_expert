export enum AppRoute {
  HOME = 'home',
  CRY_ANALYZER = 'cry-analyzer',
  FOOD_LENS = 'food-lens',
  CHAT = 'chat'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface AnalysisResult {
  title: string;
  description: string;
  advice: string[];
  confidence: 'High' | 'Medium' | 'Low';
}
