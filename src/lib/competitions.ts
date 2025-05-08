import { db } from '@/lib/firebase';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function createCompetition(name: string, userId: string) {
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  const compRef = await addDoc(collection(db, 'competitions'), {
    name,
    createdBy: userId,
    inviteCode,
    isLocked: false,
    isOngoing: false,
    createdAt: serverTimestamp(),
  });

  await setDoc(doc(db, `competitions/${compRef.id}/members/${userId}`), {
    teamName: 'Your Team',
    joinedAt: serverTimestamp(),
  });

  return { id: compRef.id, inviteCode };
}
