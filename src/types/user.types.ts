/**
 * User & Persistence Types
 * Typen für User-Daten und Persistierung
 */

export interface UserInfo {
  id: number;
  login: string;
  avatarUrl: string;
  email: string;
  isOwner: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatarUrl: string;
  score: number;
  level: number;
  timestamp: number;
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  lastUpdated: number;
}

export type LeaderboardCategory = 
  | 'coins' 
  | 'totalSpins' 
  | 'biggestWin' 
  | 'totalEarnings' 
  | 'level' 
  | 'prestigePoints';
