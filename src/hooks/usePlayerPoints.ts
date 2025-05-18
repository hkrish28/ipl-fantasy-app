import { useEffect, useState } from 'react';
import {
  collection,
  getDoc,
  getDocs,
  doc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CURRENT_SEASON } from '@/lib/constants';

export interface Player {
  id: string;
  name: string;
  role: string;
  team: string;
}

export interface PlayerWithPoints extends Player {
  points: number;
}

interface Props {
  players: Player[];
  assignments: Record<string, string>;
}

export function usePlayerPoints({ players, assignments }: Props) {
  const [playerPoints, setPlayerPoints] = useState<Record<string, number>>({});
  const [teamToPlayersMap, setTeamToPlayersMap] = useState<Record<string, PlayerWithPoints[]>>({});

  useEffect(() => {
    const fetchPoints = async () => {
      const assignedPlayerIds = Object.keys(assignments);
      const playerMap = Object.fromEntries(players.map(p => [p.id, p]));

      const points: Record<string, number> = {};
      const playerFetchPromises = assignedPlayerIds.map(async (playerId) => {
        const historyRef = collection(
          db,
          `seasons/${CURRENT_SEASON}/playerPoints/${playerId}/history`
        );

        const latestSnap = await getDocs(query(historyRef, orderBy('totalPoints', 'desc'), limit(1)));
        const docSnap = latestSnap.docs[0];
        if (docSnap) {
          points[playerId] = docSnap.data().totalPoints || 0;
        }
      });

      await Promise.all(playerFetchPromises);
      setPlayerPoints(points);

      // Map to fantasy team
      const teamMap: Record<string, PlayerWithPoints[]> = {};
      for (const playerId of assignedPlayerIds) {
        const player = playerMap[playerId];
        const teamId = assignments[playerId];
        if (!player || !teamId) continue;

        if (!teamMap[teamId]) teamMap[teamId] = [];
        teamMap[teamId].push({
          ...player,
          points: points[playerId] || 0,
        });
      }

      setTeamToPlayersMap(teamMap);
    };

    if (players.length > 0) fetchPoints();
  }, [players, assignments]);

  return { playerPoints, teamToPlayersMap };
}
