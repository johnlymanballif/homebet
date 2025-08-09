export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  lotSize: number;
  yearBuilt: number;
  propertyType: 'Single Family' | 'Condo' | 'Townhouse' | 'Multi-Family';
  images: string[];
  description: string;
  features: string[];
  source?: 'mock' | 'api';
}

export interface Player {
  id: string;
  handle: string;
  score: number;
  guesses: Guess[];
  isReady: boolean;
  joinedAt: number;
}

export interface Guess {
  propertyId: string;
  amount: number;
  points: number;
  accuracy: number;
  timestamp: number;
}

export interface GameSession {
  id: string;
  players: Player[];
  properties: Property[];
  currentPropertyIndex: number;
  status: 'waiting' | 'active' | 'completed';
  createdAt: number;
  expiresAt: number;
  winner?: string;
}

export interface ScoreCalculation {
  points: number;
  accuracy: number;
  bonus: boolean;
  perfect: boolean;
}
