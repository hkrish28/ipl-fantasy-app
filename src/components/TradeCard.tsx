import React from 'react';
import { motion } from 'framer-motion';

interface Trade {
  id: string;
  fromTeamId: string;
  toTeamId: string;
  offered: string[];
  requested: string[];
  status: string;
}

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

interface Props {
  trade: Trade;
  meId: string;
  members: Member[];
  players: Player[];
  isOutgoing?: boolean;
  onAccept?: () => Promise<void>;
  onReject?: () => Promise<void>;
  onCancel?: () => Promise<void>;
}

export default function TradeCard({
  trade,
  meId,
  members,
  players,
  isOutgoing,
  onAccept,
  onReject,
  onCancel,
}: Props) {
  const isIncoming = trade.toTeamId === meId;
  const canRespond = isIncoming && trade.status === 'pending';
  const canCancel = isOutgoing && trade.status === 'pending';

  const getTeamName = (teamId: string) =>
    members.find(m => m.id === teamId)?.teamName || teamId;

  const getPlayerName = (playerId: string) =>
    players.find(p => p.id === playerId)?.name || playerId;

console.log(meId, trade.fromTeamId, trade.toTeamId, isIncoming, isOutgoing);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ scale: 1.02, boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.1)' }}
      className="border rounded-lg p-4 bg-white"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">
          {isIncoming ? 'From' : 'To'}: <strong>{getTeamName(isIncoming ? trade.fromTeamId : trade.toTeamId)}</strong>
        </span>
        <span className="text-sm uppercase text-gray-500">{trade.status}</span>
      </div>

      <div className="mb-2">
        <p className="text-sm font-medium text-gray-700">Offered:</p>
        <ul className="ml-4 list-disc text-sm text-gray-600">
          {trade.offered.map(pid => (
            <li key={pid}>{getPlayerName(pid)}</li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700">Requested:</p>
        <ul className="ml-4 list-disc text-sm text-gray-600">
          {trade.requested.map(pid => (
            <li key={pid}>{getPlayerName(pid)}</li>
          ))}
        </ul>
      </div>

      <div className="flex space-x-2">
        {canRespond && (
          <>
            <button
              onClick={onAccept}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Accept
            </button>
            <button
              onClick={onReject}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Reject
            </button>
          </>
        )}
        {canCancel && (
          <button
            onClick={onCancel}
            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </motion.div>
  );
}
