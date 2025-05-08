import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateCompetitionPage from '../pages/create';
import mockRouter from 'next-router-mock';
import * as userHook from '@/hooks/useUser';
import * as compLib from '@/lib/competitions';

jest.mock('@/lib/firebase');

describe('CreateCompetitionPage', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/create');
    mockRouter.push = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('submits competition name and redirects on success', async () => {
    jest.spyOn(userHook, 'useUser').mockReturnValue({
      user: { uid: 'user123' } as any,
      loading: false,
    });

    jest
      .spyOn(compLib, 'createCompetition')
      .mockResolvedValue({ id: 'abc123', inviteCode: 'INV123' });

    render(<CreateCompetitionPage />);
    fireEvent.change(screen.getByPlaceholderText(/competition name/i), {
      target: { value: 'Test League' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(compLib.createCompetition).toHaveBeenCalledWith('Test League', 'user123');
      expect(mockRouter.push).toHaveBeenCalledWith('/competition/abc123');
    });
  });
});
