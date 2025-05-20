import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface Member {
  id: string;
  teamName: string;
}

interface Player {
  id: string;
  name: string;
  role: string;
  team: string;
}

type Assignments = Record<string, string>; // playerId -> teamId

interface Props {
  competitionId: string;
  myTeamId: string;
  members: Member[];
  players: Player[];
  assignments: Assignments;
  onClose: () => void;
}

export default function TradeModal({
  competitionId,
  myTeamId,
  members,
  players,
  assignments,
  onClose,
}: Props) {
  const [targetTeam, setTargetTeam] = useState<string>('');
  const [offered, setOffered] = useState<string[]>([]);
  const [requested, setRequested] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter players by assignment, not by player.team
  const myPlayers = players.filter(p => assignments[p.id] === myTeamId);
  const targetPlayers = players.filter(p => assignments[p.id] === targetTeam);

  const toggleSelection = (
    id: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setList(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await addDoc(
      collection(db, `seasons/${competitionId}/competitions/${competitionId}/trades`),
      {
        fromTeamId: myTeamId,
        toTeamId: targetTeam,
        offered,
        requested,
        status: 'pending',
        createdAt: serverTimestamp(),
      }
    );
    setLoading(false);
    onClose();
  };
  console.log(myPlayers, targetPlayers, offered, requested, myTeamId, targetTeam);
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-white rounded-lg p-6 w-full max-w-lg"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
      >
        <h2 className="text-xl font-semibold mb-4">Propose Trade</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Choose Team</label>
            <select
              value={targetTeam}
              onChange={e => setTargetTeam(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select team</option>
              {members
                .filter(m => m.id !== myTeamId)
                .map(m => (
                  <option key={m.id} value={m.id}>
                    {m.teamName}
                  </option>
                ))}
            </select>
          </div>

          {targetTeam && (
            <>
              <div>
                <p className="font-medium mb-2">Your Players to Offer:</p>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {myPlayers.map(p => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => toggleSelection(p.id, offered, setOffered)}
                      className={`px-2 py-1 border rounded-lg transition ${
                        offered.includes(p.id)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-medium mb-2">Requested Players:</p>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {targetPlayers.map(p => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => toggleSelection(p.id, requested, setRequested)}
                      className={`px-2 py-1 border rounded-lg transition ${
                        requested.includes(p.id)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || offered.length === 0 || requested.length === 0}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Proposing...' : 'Propose'}
                </button>
              </div>
            </>
          )}
        </form>
      </motion.div>
    </motion.div>
  );
}
