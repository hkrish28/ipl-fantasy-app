import { db } from '@/lib/firebase';
import { query, collection, addDoc, doc, setDoc, serverTimestamp, where, getDocs } from 'firebase/firestore';

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


  export async function joinCompetition(inviteCode: string, userId: string) {
    const q = query(collection(db, 'competitions'), where('inviteCode', '==', inviteCode));
    const snapshot = await getDocs(q);
  
    if (snapshot.empty) {
      throw new Error('Competition not found.');
    }
  
    const compDoc = snapshot.docs[0];
    const compId = compDoc.id;
  
    // Add user to members subcollection
    await setDoc(doc(db, `competitions/${compId}/members/${userId}`), {
      teamName: 'Your Team',
      joinedAt: serverTimestamp(),
    });
  
    return compId;
  }
  