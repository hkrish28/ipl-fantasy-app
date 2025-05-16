import { render, screen } from '@testing-library/react';
import mockRouter from 'next-router-mock';
import * as userHook from '@/hooks/useUser';
import CompetitionPage from '../pages/competition/[id]';

// In test
jest.mock('@/lib/firebase', () => ({
  db: {}, // mocked db
  auth: { currentUser: { uid: 'mock-user' } },
}));

jest.mock('@/lib/loadCompetitionData', () => ({
  loadCompetitionData: jest.fn().mockImplementation((_id, _uid, onAssignUpdate) => {
    onAssignUpdate({}); // empty assignments
    return Promise.resolve({
      competitionName: 'Mock IPL League',
      isAdmin: true,
      members: [],
      players: [],
      unsubscribe: () => {},
    });
  }),
}));

describe('CompetitionPage', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/competition/test-competition-id');
    mockRouter.query = { id: 'test-competition-id' };

    jest.spyOn(userHook, 'useUser').mockReturnValue({
      user: { uid: 'mock-user' } as any,
      loading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders competition page with ID', async () => {
    render(<CompetitionPage />);
    expect(await screen.findByText(/Competition: Mock IPL League/)).toBeInTheDocument();
  });
});
