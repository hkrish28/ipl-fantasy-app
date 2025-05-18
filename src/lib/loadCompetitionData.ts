// lib/loadCompetitionData.ts
import { db } from './firebase';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { CURRENT_SEASON } from './constants';

interface Player {
  id: string;
  name: string;
  role: string;
  team: string;
}

export async function loadCompetitionData(
  compId: string,
  userId: string,
  onAssignmentUpdate: (assignments: Record<string, string>) => void
) {
  const basePath = `seasons/${CURRENT_SEASON}/competitions/${compId}`;

  // Fetch competition info
  const compSnap = await getDoc(doc(db, basePath));
  if (!compSnap.exists()) return null;

  const compData = compSnap.data();
  const isAdmin = compData.createdBy === userId;

  // Fetch members
  const membersSnap = await getDocs(collection(db, basePath, 'members'));
  const members = membersSnap.docs.map((d) => ({
    id: d.id,
    teamName: d.data().teamName,
  }));

  // Fetch players
  const playerSnap = await getDocs(collection(db, `seasons/${CURRENT_SEASON}/players`));
  const players: Player[] = playerSnap.docs.map((d) => ({
    id: d.id, role: d.data().role, team: d.data().team, name: d.data().name }));

  // Subscribe to assignment changes
  const unsubscribe = onSnapshot(collection(db, basePath, 'assignments'), (snap) => {
    const map: Record<string, string> = {};
    snap.forEach((doc) => {
      map[doc.id] = doc.data().assignedTo;
    });
    onAssignmentUpdate(map);
  });

  return {
    competitionName: compData.name,
    isAdmin,
    locked: compData.isLocked,
    members,
    players,
    unsubscribe,
    inviteCode: compData.inviteCode,
  };
}
