import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import JoinPage from '@/pages/join';
import * as userHook from '@/hooks/useUser';
import * as compModule from '@/lib/competitions';
import mockRouter from 'next-router-mock';

jest.mock('@/lib/firebase'); // Prevent real Firebase init

describe('JoinPage', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/join');
    jest.spyOn(userHook, 'useUser').mockReturnValue({
      user: { uid: 'mock-user' } as any,
      loading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders form inputs and submits with valid data', async () => {
    const mockJoin = jest.spyOn(compModule, 'joinCompetition').mockResolvedValue('mock-comp-id');

    render(<JoinPage />);

    fireEvent.change(screen.getByPlaceholderText('Invite Code'), {
      target: { value: 'ABC123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Your Fantasy Team Name'), {
      target: { value: 'Hari XI' },
    });

    fireEvent.click(screen.getByRole('button', { name: /join/i }));

    await waitFor(() => {
      expect(mockJoin).toHaveBeenCalledWith('ABC123', 'mock-user', 'Hari XI');
      expect(mockRouter).toMatchObject({ pathname: '/competition/mock-comp-id' });
    });
  });

  test('shows error on failed join', async () => {
    jest.spyOn(compModule, 'joinCompetition').mockRejectedValue(new Error('Invalid code'));

    render(<JoinPage />);

    fireEvent.change(screen.getByPlaceholderText('Invite Code'), {
      target: { value: 'BADCODE' },
    });
    fireEvent.change(screen.getByPlaceholderText('Your Fantasy Team Name'), {
      target: { value: 'Oops FC' },
    });

    fireEvent.click(screen.getByRole('button', { name: /join/i }));

    expect(await screen.findByText('Invalid code')).toBeInTheDocument();
  });
});
