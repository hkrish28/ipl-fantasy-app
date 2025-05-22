import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/hooks/useUser';
import Layout from '@/components/Layout';
import { loadCompetitionData } from '@/lib/loadCompetitionData';
import { assignPlayer } from '@/lib/assignments';
import AdminAssignmentPanel from '@/components/AdminAssignmentPanel';
import toast from 'react-hot-toast';
import { doc, updateDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CURRENT_SEASON } from '@/lib/constants';
import { usePlayerPoints } from '@/hooks/usePlayerPoints';
import PointsTrendChart from '@/components/PointsTrendChart';

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

interface LeaderboardEntry {
  member: Member;
  total: number;
  diff: number;
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
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const { playerPoints, teamToPlayersMap } = usePlayerPoints({ players, assignments });

  // Load competition data
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

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  // Build leaderboard with diff from previous day
  useEffect(() => {
    if (!id || typeof id !== 'string' || members.length === 0) return;
    const fetchLeaderboard = async () => {
      const entries = await Promise.all(
        members.map(async member => {
          const histRef = collection(
            db,
            `seasons/${CURRENT_SEASON}/competitions/${id}/leaderboard/${member.id}/history`
          );
          const q = query(histRef, orderBy('__name__', 'desc'), limit(2));
          const snap = await getDocs(q);
          const pointsArr = snap.docs.map(d => d.data().totalPoints as number);
          const today = pointsArr[0] || 0;
          const yesterday = pointsArr[1] || 0;
          return { member, total: today, diff: today - yesterday };
        })
      );
      entries.sort((a, b) => b.total - a.total);
      setLeaderboard(entries);
    };
    fetchLeaderboard();
  }, [id, members]);

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
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">{competitionName}</h1>
          {inviteCode && !locked && (
            <span className="mt-3 sm:mt-0 inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 font-mono rounded-lg">
              Invite Code: {inviteCode}
            </span>
          )}
        </div>

        {/* Admin actions */}
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
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${locked ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{locked ? 'Ongoing' : 'Setup'}</span>
          </div>
        )}

        {/* Leaderboard table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Leaderboard</h2>
      {/* Make table horizontally scrollable on small screens */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Rank</th>
              <th className="px-4 py-2 text-left">Team</th>
              <th className="px-4 py-2 text-right">Total Points</th>
              <th className="px-4 py-2 text-right">Change</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, idx) => (
              <tr key={entry.member.id} className="border-t">
                <td className="px-4 py-2 whitespace-nowrap">{idx + 1}</td>
                <td className="px-4 py-2 whitespace-nowrap">{entry.member.teamName}</td>
                <td className="px-4 py-2 text-right whitespace-nowrap font-semibold">{entry.total}</td>
                <td className={`px-4 py-2 text-right whitespace-nowrap ${
                    entry.diff > 0 ? 'text-green-600' :
                    entry.diff < 0 ? 'text-red-600' :
                    'text-gray-700'
                  }`}>
                  {entry.diff > 0 ? `+${entry.diff}` : entry.diff < 0 ? `${entry.diff}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

        {/* Assignment Panel */}
        {(isAdmin || locked) && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
            <AdminAssignmentPanel
              competitionId={id as string}
              myTeamId={user!.uid}
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


        {/* Points trend chart */}
        <PointsTrendChart competitionId={id as string} members={members} />
      </div>
    </Layout>
  );
}