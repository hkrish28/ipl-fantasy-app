import { useState, useMemo } from 'react';

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

interface Props {
  players: Player[];
  members: Member[];
  assignments: Record<string, string>;
  onAssign: (playerId: string, memberId: string) => void;
}

export default function PlayerList({ players, members, assignments, onAssign }: Props) {
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [teamFilter, setTeamFilter] = useState<string>('');

  const uniqueRoles = useMemo(
    () => Array.from(new Set(players.map(p => p.role))).sort(),
    [players]
  );
  const uniqueTeams = useMemo(
    () => Array.from(new Set(players.map(p => p.team))).sort(),
    [players]
  );

  const filtered = useMemo(
    () => players.filter(p =>
      p.name.toLowerCase().includes(searchText.toLowerCase()) &&
      (roleFilter ? p.role === roleFilter : true) &&
      (teamFilter ? p.team === teamFilter : true)
    ),
    [players, searchText, roleFilter, teamFilter]
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search players..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Roles</option>
          {uniqueRoles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
        <select
          value={teamFilter}
          onChange={e => setTeamFilter(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Teams</option>
          {uniqueTeams.map(team => (
            <option key={team} value={team}>{team}</option>
          ))}
        </select>
      </div>

      {/* Player List */}
      <ul className="divide-y">
        {filtered.map(player => (
          <li
            key={player.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50 transition"
          >
            <div>
              <p className="font-medium text-gray-800">{player.name}</p>
              <p className="text-sm text-gray-500">
                {player.role} &mdash; {player.team}
              </p>
            </div>
            <select
              value={assignments[player.id] || ''}
              onChange={e => onAssign(player.id, e.target.value)}
              className="mt-2 sm:mt-0 w-full sm:w-auto px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Unassigned --</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.teamName}</option>
              ))}
            </select>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="text-center py-6 text-gray-500">
            No players match your criteria.
          </li>
        )}
      </ul>
    </div>
  );
}
