import type { Timestamp } from 'firebase/firestore';

export interface Competition {
  name: string;
  createdBy: string; // userId
  inviteCode: string;
  isLocked: boolean;
  isOngoing: boolean;
  createdAt: Timestamp;
}

export interface CompetitionMember {
  teamName: string;
  joinedAt: Timestamp;
}

export interface Assignment {
  assignedTo: string; // userId
  assignedAt: Timestamp;
}
