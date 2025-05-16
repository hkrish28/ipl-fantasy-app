import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateCompetitionPage from '@/pages/create';
import * as userHook from '@/hooks/useUser';
import * as competitionsModule from '@/lib/competitions';
import mockRouter from 'next-router-mock';

jest.mock('@/lib/firebase'); // Prevent real Firebase initialization

describe('CreateCompetitionPage', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/create');
    jest.spyOn(userHook, 'useUser').mockReturnValue({
      user: { uid: 'mock-user' } as any,
      loading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('creates competition and navigates to it', async () => {
    const mockCreate = jest
      .spyOn(competitionsModule, 'createCompetition')
      .mockResolvedValue('mock-comp-id');

    render(<CreateCompetitionPage />);

    fireEvent.change(screen.getByPlaceholderText('Competition Name'), {
      target: { value: 'Test League' },
    });

    fireEvent.change(screen.getByPlaceholderText('Your Team Name'), {
      target: { value: 'Super Strikers' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Create/i }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith('Test League', 'mock-user', 'Super Strikers');
      expect(mockRouter).toMatchObject({ pathname: '/competition/mock-comp-id' });
    });
  });
});
