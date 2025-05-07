import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: Timestamp;
}
