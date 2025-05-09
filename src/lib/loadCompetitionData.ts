import {
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
  } from 'firebase/firestore';
  import { db } from './firebase';
  
  export async function loadCompetitionData(
    competitionId: string,
    userId: string,
    onAssignmentUpdate: (map: Record<string, string>) => void
  ) {
    const compSnap = await getDoc(doc(db, 'competitions', competitionId));
    if (!compSnap.exists()) return null;
  
    const compData = compSnap.data();
    const isAdmin = compData.createdBy === userId;
  
    const membersSnap = await getDocs(
      collection(db, 'competitions', competitionId, 'members')
    );
    const members = membersSnap.docs.map((doc) => ({
      id: doc.id,
      teamName: doc.data().teamName || 'Unnamed Team',
    }));
  
    const playersSnap = await getDocs(collection(db, 'players'));
    const players = playersSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  
    const unsubscribe = onSnapshot(
      collection(db, 'competitions', competitionId, 'assignments'),
      (snap) => {
        const map: Record<string, string> = {};
        snap.forEach((doc) => {
          const data = doc.data();
          map[doc.id] = data.assignedTo;
        });
        onAssignmentUpdate(map);
      }
    );
  
    return {
      competitionName: compData.name || '',
      isAdmin,
      members,
      players,
      unsubscribe,
    };
  }
  