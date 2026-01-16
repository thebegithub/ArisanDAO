export enum ArisanStatus {
  OPEN = 'OPEN',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED'
}

export type UserRole = 'ADMIN' | 'USER' | null;

export interface User {
  id: string;
  walletAddress: string;
  username: string; // From Supabase
  avatarUrl: string; // From Supabase
  reputationScore: number; // On-chain credit score
}

export interface Participant {
  user: User;
  hasPaid: boolean;
  hasWon: boolean;
  joinedAt: string;
}

export interface ArisanGroup {
  id: string;
  name: string;
  description: string;
  amountPerCycle: number; // e.g., 10 USDT
  currency: 'USDT' | 'USDC' | 'LSK';
  cyclePeriod: 'Weekly' | 'Monthly';
  maxParticipants: number;
  currentCycle: number;
  status: ArisanStatus;
  participants: Participant[];
  winners: string[]; // Array of Wallet Addresses
  poolBalance: number;
  entryFeeWei: string; // Store raw Wei value to prevent float precision errors
  createdAt: string;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string;
}
