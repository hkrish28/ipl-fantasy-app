import PlayerList from './PlayerList';

interface Props {
  locked: boolean;
  players: Player[];
  members: Member[];
  assignments: Record<string, string>;
  onAssign: (playerId: string, memberId: string) => Promise<void>;
}

export default function AdminAssignmentPanel({
  locked,
  players,
  members,
  assignments,
  onAssign,
}: Props) {
  if (locked) {
    return (
      <p className="text-red-600 font-medium">
        Competition is locked. No further assignments allowed.
      </p>
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
