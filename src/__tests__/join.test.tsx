import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import JoinPage from '../pages/join';
import * as userHook from '@/hooks/useUser';
import * as compLib from '@/lib/competitions';
import mockRouter from 'next-router-mock';

jest.mock('@/lib/firebase');

describe('JoinPage', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/join');
    mockRouter.push = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('submits invite code and redirects on success', async () => {
    jest.spyOn(userHook, 'useUser').mockReturnValue({
      user: { uid: 'user456' } as any,
      loading: false,
    });

    jest
      .spyOn(compLib, 'joinCompetition')
      .mockResolvedValue('comp789');

    render(<JoinPage />);
    fireEvent.change(screen.getByPlaceholderText(/invite code/i), {
      target: { value: 'INV123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /join/i }));

    await waitFor(() => {
      expect(compLib.joinCompetition).toHaveBeenCalledWith('INV123', 'user456');
      expect(mockRouter.push).toHaveBeenCalledWith('/competition/comp789');
    });
  });
});
