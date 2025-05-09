import {
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
  } from 'firebase/firestore';
  import { db } from './firebase';
  
  export async function loadCompetitionData(
    id: string,
    currentUserId: string,
    onAssignments: (map: Record<string, string>) => void
  ): Promise<{
    competitionName: string;
    isAdmin: boolean;
    locked: boolean;
    members: Member[];
    players: Player[];
  } | null> {
    const compSnap = await getDoc(doc(db, 'competitions', id));
    if (!compSnap.exists()) return null;
  
    const compData = compSnap.data();
    const locked = !!compData.isLocked;
  
    const isAdmin = compData.createdBy === currentUserId;
  
    const memberSnap = await getDocs(collection(db, 'competitions', id, 'members'));
    const members: Member[] = memberSnap.docs.map((doc) => ({
      id: doc.id,
      teamName: doc.data().teamName || 'Unnamed Team',
    }));
  
    const playerSnap = await getDocs(collection(db, 'players'));
    const players: Player[] = playerSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Player[];
  
    onSnapshot(collection(db, 'competitions', id, 'assignments'), (snap) => {
      const map: Record<string, string> = {};
      snap.forEach((doc) => {
        map[doc.id] = doc.data().assignedTo;
      });
      onAssignments(map);
    });
  
    return {
      competitionName: compData.name || '',
      isAdmin,
      locked,
      members,
      players,
    };
  }
  
  