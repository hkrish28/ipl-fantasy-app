// src/components/PlayerList.tsx
import { useState } from 'react';

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
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [teamFilter, setTeamFilter] = useState<string | null>(null);

  const filtered = players.filter(
    (p) =>
      (!searchText || p.name.toLowerCase().includes(searchText.toLowerCase())) &&
      (!roleFilter || p.role === roleFilter) &&
      (!teamFilter || p.team === teamFilter)
  );

  return (
    <>
      <input
        placeholder="Search players..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <label>
        Filter by Role
        <select value={roleFilter || ''} onChange={(e) => setRoleFilter(e.target.value || null)}>
          <option value="">All Roles</option>
          <option value="Batsman">Batsman</option>
          <option value="Bowler">Bowler</option>
          <option value="All-Rounder">All-Rounder</option>
          <option value="WK">Wicket-Keeper</option>
        </select>
      </label>
      <label>
        Filter by IPL Team
        <select value={teamFilter || ''} onChange={(e) => setTeamFilter(e.target.value || null)}>
          <option value="">All Teams</option>
          {[...new Set(players.map((p) => p.team))].sort().map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
      </label>

      <ul>
        {filtered.map((player) => (
          <li key={player.id}>
            {player.name} - {player.role} - {player.team}
            <select
              value={assignments[player.id] || ''}
              onChange={(e) => onAssign(player.id, e.target.value)}
            >
              <option value="">-- Unassigned --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.teamName}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </>
  );
}
