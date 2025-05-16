import { db } from '@/lib/firebase';
import { query, collection, addDoc, doc, setDoc, serverTimestamp, where, getDocs } from 'firebase/firestore';
import { CURRENT_SEASON } from './constants';
import { v4 as uuidv4 } from 'uuid';

function generateInviteCode(): string {
  return uuidv4().slice(0, 6).toUpperCase();
}

export async function createCompetition(name: string, createdBy: string, teamName: string) {
  const ref = collection(db, `seasons/${CURRENT_SEASON}/competitions`);
  const docRef = await addDoc(ref, {
    name,
    createdBy,
    isLocked: false,
    createdAt: new Date(),
    inviteCode: generateInviteCode(),
  });

  // Add creator as first member
  await setDoc(doc(db, `seasons/${CURRENT_SEASON}/competitions/${docRef.id}/members/${createdBy}`), {
    teamName,
    joinedAt: serverTimestamp(),
  });

  return docRef.id;
}


export async function joinCompetition(inviteCode: string, userId: string, teamName: string) {
  const q = query(
    collection(db, `seasons/${CURRENT_SEASON}/competitions`),
    where('inviteCode', '==', inviteCode)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error('Competition not found.');
  }

  const compDoc = snapshot.docs[0];
  const compId = compDoc.id;

  await setDoc(
    doc(db, `seasons/${CURRENT_SEASON}/competitions/${compId}/members/${userId}`),
    {
      teamName,
      joinedAt: serverTimestamp(),
    }
  );

  return compId;
}
/**
 * Assigns a player to a fantasy team within a competition.
 * @param competitionId The ID of the competition
 * @param playerId The ID of the IPL player
 * @param userId The ID of the fantasy team (user)
 */
export async function assignPlayer(
  competitionId: string,
  playerId: string,
  userId: string
): Promise<void> {
  const assignmentRef = doc(
    db,
    `seasons/${CURRENT_SEASON}/competitions/${competitionId}/assignments/${playerId}`
  );

  await setDoc(assignmentRef, {
    assignedTo: userId,
    assignedAt: serverTimestamp(),
  });
}

  