// Firebase timestamp type
import type { Timestamp } from 'firebase/firestore';

// User
export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: Timestamp;
}

// Competition
export interface Competition {
  name: string;
  createdBy: string; // userId
  inviteCode: string;
  isLocked: boolean;
  isOngoing: boolean;
  createdAt: Timestamp;
}

// Member (Fantasy Team)
export interface CompetitionMember {
  teamName: string;
  joinedAt: Timestamp;
}

// Player
export interface Player {
  name: string;
  team: string; // e.g., "RCB"
  role: 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket-Keeper';
}

// Assignment (one per competition, one player → one team)
export interface Assignment {
  assignedTo: string; // userId
  assignedAt: Timestamp;
}

// Score per player per match
export interface PlayerScore {
  playerId: string;
  matchDate: string; // e.g., '2025-04-01'
  points: number;
}
