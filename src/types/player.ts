export interface Player {
    name: string;
    team: string; // e.g., "RCB"
    role: 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket-Keeper';
  }
  