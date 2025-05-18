import PlayerList from './PlayerList';

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
      <>
        {members.map((member) => {
          const teamPlayers = teamToPlayersMap[member.id] || [];
          const totalPoints = teamPlayers.reduce((sum, p) => sum + p.points, 0);

          return (
            <details key={member.id} className="mb-4 border rounded">
              <summary className="cursor-pointer px-4 py-2 font-semibold bg-gray-100">
                {member.teamName} — {totalPoints} pts
              </summary>
              <ul className="px-4 py-2">
                {teamPlayers.map((player) => (
                  <li
                    key={player.id}
                    className="py-1 border-b text-sm flex justify-between"
                  >
                    <span>{player.name} ({player.role})</span>
                    <span className="font-mono">{player.points} pts</span>
                  </li>
                ))}
                {teamPlayers.length === 0 && (
                  <li className="text-gray-500">No players assigned</li>
                )}
              </ul>
            </details>
          );
        })}
      </>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-gray-600">
        Assign players to fantasy teams:
      </p>
      <PlayerList
        players={players}
        members={members}
        assignments={assignments}
        onAssign={onAssign}
      />
    </>
  );
}
