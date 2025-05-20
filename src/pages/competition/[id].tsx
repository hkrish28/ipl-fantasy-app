import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/hooks/useUser';
import Layout from '@/components/Layout';
import { loadCompetitionData } from '@/lib/loadCompetitionData';
import { assignPlayer } from '@/lib/assignments';
import AdminAssignmentPanel from '@/components/AdminAssignmentPanel';
import toast from 'react-hot-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CURRENT_SEASON } from '@/lib/constants';
import { usePlayerPoints } from '@/hooks/usePlayerPoints';

interface Player {
  id: string;
  name: string;
  role: string;
  team: string;
}

interface Member {
  id: string;
  teamName: string;
}

export default function CompetitionPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const { id } = router.query;

  const [isAdmin, setIsAdmin] = useState(false);
  const [competitionName, setCompetitionName] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [locked, setLocked] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const { playerPoints, teamToPlayersMap } = usePlayerPoints({ players, assignments });

  // Load data
  useEffect(() => {
    if (!id || typeof id !== 'string' || loading || !user) return;

    loadCompetitionData(id, user.uid, map => setAssignments(map))
      .then(data => {
        if (!data) return;
        setCompetitionName(data.competitionName);
        setIsAdmin(data.isAdmin);
        setMembers(data.members);
        setPlayers(data.players);
        setLocked(data.locked);
        setInviteCode(data.inviteCode || null);
      })
      .catch(() => toast.error('Failed to load competition data'));
  }, [id, user, loading]);

  // Redirect if unauthenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin h-10 w-10 border-4 border-gray-300 border-t-indigo-600 rounded-full"></div>
        </div>
      </Layout>
    );
  }

  const handleLock = async () => {
    if (!id || typeof id !== 'string') return;
    try {
      await updateDoc(doc(db, `seasons/${CURRENT_SEASON}/competitions`, id), { isLocked: true });
      setLocked(true);
      toast.success('Competition locked!');
    } catch {
      toast.error('Unable to lock competition');
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">
            {competitionName}
          </h1>
          {inviteCode && !locked && (
            <span className="mt-3 sm:mt-0 inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 font-mono rounded-lg">
              Invite Code: {inviteCode}
            </span>
          )}
        </div>

        {/* Actions */}
        {isAdmin && (
          <div className="flex items-center space-x-4">
            {!locked && (
              <button
                onClick={handleLock}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Lock Competition
              </button>
            )}
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full $
                locked
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              `}
            >
              {locked ? 'Ongoing' : 'Setup'}
            </span>
          </div>
        )}

        {/* Non-admin message */}
        {!isAdmin && (
          <p className="text-gray-600">You are not the admin of this competition.</p>
        )}

        {/* Assignment Panel */}
        {isAdmin && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
            <AdminAssignmentPanel
              locked={locked}
              players={players}
              members={members}
              assignments={assignments}
              teamToPlayersMap={teamToPlayersMap}
              onAssign={(playerId, memberId) => {
                const promise = assignPlayer(id as string, playerId, memberId);
                toast.promise(promise, {
                  loading: 'Assigning...',
                  success: 'Player assigned!',
                  error: 'Failed to assign',
                });
                return promise;
              }}
            />
          </div>
        )}

        {/* Team Points Overview */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Team Points Overview</h2>
          <ul className="space-y-2">
            {Object.entries(teamToPlayersMap).map(([teamId, teamPlayers]) => {
              const total = teamPlayers.reduce((sum, p) => sum + p.points, 0);
              const member = members.find(m => m.id === teamId);
              return (
                <li key={teamId} className="flex justify-between">
                  <span className="font-medium text-gray-700">{member?.teamName || 'Team'}</span>
                  <span className="font-semibold text-indigo-600">{total}</span>
                </li>
              );
            })}
          </ul>
        </div>

      </div>
    </Layout>
  );
}
