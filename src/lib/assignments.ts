import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

/**
 * Assign a player to a fantasy team.
 * @param competitionId - ID of the competition
 * @param playerId - ID of the player
 * @param memberId - ID of the member/team
 */
export async function assignPlayer(
  competitionId: string,
  playerId: string,
  memberId: string
): Promise<void> {
  const ref = doc(db, 'competitions', competitionId, 'assignments', playerId);
  await setDoc(ref, { assignedTo: memberId });
}
