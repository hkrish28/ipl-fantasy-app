import { render, screen, fireEvent } from '@testing-library/react';
import PlayerList from '@/components/PlayerList';

describe('PlayerList filtering', () => {
  const players = [
    { id: 'p1', name: 'Virat Kohli', role: 'Batsman', team: 'RCB' },
    { id: 'p2', name: 'Jasprit Bumrah', role: 'Bowler', team: 'MI' },
    { id: 'p3', name: 'MS Dhoni', role: 'WK', team: 'CSK' },
  ];

  const members = [
    { id: 'team1', teamName: 'Team Alpha' },
    { id: 'team2', teamName: 'Team Beta' },
  ];

  test('search and filter works', () => {
    render(
      <PlayerList
        players={players}
        members={members}
        assignments={{}}
        onAssign={() => {}}
      />
    );

    // 🔍 Search by name
    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: 'Virat' },
    });
    expect(screen.getByText(/Virat Kohli/)).toBeInTheDocument();
    expect(screen.queryByText(/MS Dhoni/)).not.toBeInTheDocument();

    // 🔁 Clear search before role filter
    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: '' },
    });

    // 🎯 Filter by role
    fireEvent.change(screen.getByLabelText(/Filter by Role/i), {
      target: { value: 'Bowler' },
    });
    expect(screen.getByText(/Jasprit Bumrah/)).toBeInTheDocument();
    expect(screen.queryByText(/Virat Kohli/)).not.toBeInTheDocument();

    // 🧼 Clear role filter before applying team filter
    fireEvent.change(screen.getByLabelText(/Filter by Role/i), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText(/Filter by IPL Team/i), {
      target: { value: 'CSK' },
    });
    expect(screen.getByText(/MS Dhoni/)).toBeInTheDocument();
    expect(screen.queryByText(/Jasprit Bumrah/)).not.toBeInTheDocument();
  });
});
