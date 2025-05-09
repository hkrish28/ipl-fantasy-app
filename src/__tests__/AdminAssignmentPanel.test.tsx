import { render, screen } from '@testing-library/react';
import AdminAssignmentPanel from '@/components/AdminAssignmentPanel';

describe('AdminAssignmentPanel', () => {
  const mockPlayers = [
    { id: '1', name: 'Virat Kohli', role: 'Batsman', team: 'RCB' },
  ];

  const mockMembers = [
    { id: 'team1', teamName: 'Team Alpha' },
  ];

  const mockAssignments = {
    '1': 'team1',
  };

  const mockOnAssign = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('shows locked message when competition is locked', () => {
    render(
      <AdminAssignmentPanel
        locked={true}
        players={mockPlayers}
        members={mockMembers}
        assignments={mockAssignments}
        onAssign={mockOnAssign}
      />
    );

    expect(screen.getByText(/competition is locked/i)).toBeInTheDocument();
    expect(screen.queryByText(/assign players/i)).not.toBeInTheDocument();
  });

  test('renders assignment UI when unlocked', () => {
    render(
      <AdminAssignmentPanel
        locked={false}
        players={mockPlayers}
        members={mockMembers}
        assignments={mockAssignments}
        onAssign={mockOnAssign}
      />
    );

    expect(screen.getByText(/assign players to fantasy teams/i)).toBeInTheDocument();
    expect(screen.getByText(/virat kohli/i)).toBeInTheDocument();
    expect(screen.getAllByRole('combobox').length).toBeGreaterThan(2);

  });
});
