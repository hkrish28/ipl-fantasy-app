import { render, screen } from '@testing-library/react';
import mockRouter from 'next-router-mock';
import * as userHook from '@/hooks/useUser';
import * as loader from '@/lib/loadCompetitionData';
import CompetitionPage from '@/pages/competition/[id]';

// Mock useUser
jest.mock('@/hooks/useUser');

// Mock Firestore loader
jest.mock('@/lib/loadCompetitionData');

describe('CompetitionPage - Lock Behavior', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/competition/mock-id');
    mockRouter.query = { id: 'mock-id' };

    (userHook.useUser as jest.Mock).mockReturnValue({
      user: { uid: 'admin-user' },
      loading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders lock message when competition is locked', async () => {
    (loader.loadCompetitionData as jest.Mock).mockResolvedValue({
      competitionName: 'Mock Comp',
      isAdmin: true,
      locked: true, // ✅ FIXED
      players: [],
      members: [],
    });
  
    render(<CompetitionPage />);
    expect(await screen.findByText(/competition is locked/i)).toBeInTheDocument();
    expect(screen.queryByText(/Assign players to fantasy teams/i)).not.toBeInTheDocument();
  });
  

  test('renders assignment UI when competition is not locked', async () => {
    (loader.loadCompetitionData as jest.Mock).mockResolvedValue({
      competitionName: 'Mock Comp',
      isAdmin: true,
      isLocked: false,
      players: [],
      members: [],
    });

    render(<CompetitionPage />);
    expect(await screen.findByText(/Assign players to fantasy teams/i)).toBeInTheDocument();
    expect(screen.queryByText(/competition is locked/i)).not.toBeInTheDocument();
  });
});
