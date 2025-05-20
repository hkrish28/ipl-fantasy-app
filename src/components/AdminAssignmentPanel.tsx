import PlayerList from './PlayerList';
import { motion, AnimatePresence } from 'framer-motion';

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

interface PlayerWithPoints extends Player {
  points: number;
}

interface Props {
  locked: boolean;
  players: Player[];
  members: Member[];
  assignments: Record<string, string>;
  teamToPlayersMap: Record<string, PlayerWithPoints[]>;
  onAssign: (playerId: string, memberId: string) => Promise<void>;
}

export default function AdminAssignmentPanel({
  locked,
  players,
  members,
  assignments,
  teamToPlayersMap,
  onAssign,
}: Props) {
  if (locked) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {members.map(member => {
          const teamPlayers = teamToPlayersMap[member.id] || [];
          const totalPoints = teamPlayers.reduce((sum, p) => sum + p.points, 0);
          return (
            <div
              key={member.id}
              className="border rounded-2xl shadow-sm overflow-hidden"
            >
              <summary className="bg-gray-50 px-5 py-3 font-semibold text-gray-800 flex justify-between items-center">
                <span>{member.teamName}</span>
                <span className="text-indigo-600 font-mono">{totalPoints} pts</span>
              </summary>
              <AnimatePresence>
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-white px-5 py-4 space-y-2"
                >
                  {teamPlayers.length > 0 ? (
                    teamPlayers.map(player => (
                      <li
                        key={player.id}
                        className="flex justify-between text-sm text-gray-700"
                      >
                        <span>{player.name} ({player.role})</span>
                        <span className="font-mono text-gray-900">
                          {player.points} pts
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 text-sm">
                      No players assigned
                    </li>
                  )}
                </motion.ul>
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    );
  }

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
