// lib/assignments.ts
import { db } from './firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { CURRENT_SEASON } from './constants';

export async function assignPlayer(
  compId: string,
  playerId: string,
  memberId: string
) {
  const path = `seasons/${CURRENT_SEASON}/competitions/${compId}/assignments/${playerId}`;
  const ref = doc(db, path);

  await setDoc(ref, {
    assignedTo: memberId,
    assignedAt: serverTimestamp(),
  });
}
