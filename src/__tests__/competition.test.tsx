import { render, screen } from '@testing-library/react';
import mockRouter from 'next-router-mock';
import * as userHook from '@/hooks/useUser';
import CompetitionPage from '../pages/competition/[id]';

jest.mock('@/lib/firebase');

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

  test('renders competition page with ID', () => {
    render(<CompetitionPage />);
    expect(screen.getByText(/Competition: test-competition-id/)).toBeInTheDocument();
  });
});
