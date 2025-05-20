import React, { useState, useEffect } from 'react';
import PlayerList from './PlayerList';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from 'firebase/firestore';
import TradeModal from './TradeModal';
import TradeCard from './TradeCard';

interface Player {
  id: string;
  name: string;
  role: string;
  team: string;
}

interface PlayerWithPoints extends Player {
  points: number;
  prevPoints?: number;
}

interface Member {
  id: string;
  teamName: string;
}

type Assignments = Record<string, string>; // maps playerId to fantasy teamId

type ViewMode = 'team' | 'points' | 'role' | 'trades';
type TradeStatus = 'pending' | 'accepted' | 'rejected';

interface Trade {
  id: string;
  fromTeamId: string;
  toTeamId: string;
  offered: string[];
  requested: string[];
  status: TradeStatus;
}

interface Props {
  competitionId: string;
  myTeamId: string;
  locked: boolean;
  players: Player[];
  members: Member[];
  assignments: Assignments;
  teamToPlayersMap: Record<string, PlayerWithPoints[]>;
  onAssign: (playerId: string, memberId: string) => Promise<void>;
}

export default function AdminAssignmentPanel({
  competitionId,
  myTeamId,
  locked,
  players,
  members,
  assignments,
  teamToPlayersMap,
  onAssign,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('team');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Real-time trade listener
  useEffect(() => {
    const tradesRef = collection(
      db,
      `seasons/${competitionId}/competitions/${competitionId}/trades`
    );
    const q = query(tradesRef, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setTrades(
        snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Trade, 'id'>) }))
      );
    });
    return () => unsub();
  }, [competitionId]);

  // Sorting comparators
  const comparators: Record<ViewMode, (a: PlayerWithPoints, b: PlayerWithPoints) => number> = {
    team: (a, b) => a.name.localeCompare(b.name),
    points: (a, b) => b.points - a.points,
    role: (a, b) => a.role.localeCompare(b.role),
    trades: () => 0,
  };

  if (locked) {
    const incoming = trades.filter(t => t.toTeamId === myTeamId);
    const outgoing = trades.filter(t => t.fromTeamId === myTeamId);

    return (
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex border-b">
          {([
            { key: 'team', label: 'Name' },
            { key: 'points', label: 'Points' },
            { key: 'role', label: 'Role' },
            { key: 'trades', label: 'Trades' },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setViewMode(key)}
              className={`py-2 px-4 -mb-px font-medium text-sm focus:outline-none transition ${
                viewMode === key
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {viewMode === 'trades' ? (
          <div className="space-y-4">
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Propose Trade
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Incoming Proposals</h3>
                <div className="space-y-4">
                  {incoming.map(trade => (
                    <TradeCard
                      key={trade.id}
                      trade={trade}
                      meId={myTeamId}
                      members={members}
                      players={players}
                      onAccept={async () => {
                        await updateDoc(
                          doc(
                            db,
                            `seasons/${competitionId}/competitions/${competitionId}/trades`,
                            trade.id
                          ),
                          { status: 'accepted' }
                        );
                      }}
                      onReject={async () => {
                        await updateDoc(
                          doc(
                            db,
                            `seasons/${competitionId}/competitions/${competitionId}/trades`,
                            trade.id
                          ),
                          { status: 'rejected' }
                        );
                      }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Outgoing Proposals</h3>
                <div className="space-y-4">
                  {outgoing.map(trade => (
                    <TradeCard
                      key={trade.id}
                      trade={trade}
                      meId={myTeamId}
                      isOutgoing
                      members={members}
                      players={players}
                      onCancel={async () => {
                        await updateDoc(
                          doc(
                            db,
                            `seasons/${competitionId}/competitions/${competitionId}/trades`,
                            trade.id
                          ),
                          { status: 'rejected' }
                        );
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {showModal && (
              <TradeModal
                competitionId={competitionId}
                myTeamId={myTeamId}
                members={members}
                players={players}
                assignments={assignments}
                onClose={() => setShowModal(false)}
              />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map(member => {
              const rawPlayers = teamToPlayersMap[member.id] || [];
              const sortedPlayers = [...rawPlayers].sort(comparators[viewMode]);
              const totalPoints = sortedPlayers.reduce((sum, p) => sum + p.points, 0);

              return (
                <div
                  key={member.id}
                  className="border rounded-2xl shadow-sm overflow-hidden bg-white"
                >
                  <div className="bg-gray-50 px-5 py-3 font-semibold text-gray-800 flex justify-between items-center">
                    <span>{member.teamName}</span>
                    <span className="text-indigo-600 font-mono">{totalPoints} pts</span>
                  </div>
                  <AnimatePresence>
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-white px-5 py-4 space-y-2"
                    >
                      {sortedPlayers.length > 0 ? (
                        sortedPlayers.map(player => {
                          const diff = player.prevPoints != null
                            ? player.points - player.prevPoints
                            : undefined;
                          return (
                            <li
                              key={player.id}
                              className="flex justify-between text-sm text-gray-700"
                            >
                              <div>
                                <span>{player.name}</span>
                                <span className="text-gray-500">{' '}({player.role})</span>
                              </div>
                              <div className="text-right">
                                <span className="font-mono text-gray-900">{player.points} pts</span>
                                {diff != null && diff !== 0 && (
                                  <span
                                    className={`ml-2 text-xs font-medium ${
                                      diff > 0
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                    }`}
                                  >
                                    {diff > 0 ? `+${diff}` : diff}
                                  </span>
                                )}
                              </div>
                            </li>
                          );
                        })
                      ) : (
                        <li className="text-gray-500 text-sm">No players assigned</li>
                      )}
                    </motion.ul>
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Pre-lock assignment view
  return (
    <div className="space-y-6">
      <p className="text-gray-600">Assign players to fantasy teams:</p>
      <div className="border rounded-2xl shadow-sm p-4 bg-white">
        <PlayerList
          players={players}
          members={members}
          assignments={assignments}
          onAssign={onAssign}
        />
      </div>
    </div>
  );
}
