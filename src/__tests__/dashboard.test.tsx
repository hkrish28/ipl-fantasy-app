import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../pages/dashboard';
import * as userHook from '@/hooks/useUser';
import mockRouter from 'next-router-mock';

// Make sure to use the same mock
jest.mock('@/lib/firebase');

describe('Dashboard Page', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/dashboard');
    mockRouter.push = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard content when user is authenticated', () => {
    jest.spyOn(userHook, 'useUser').mockReturnValue({
      user: { displayName: 'Hari' } as any,
      loading: false,
    });

    render(<Dashboard />);

    expect(screen.getByText('Your Competitions')).toBeInTheDocument();
    expect(screen.getByText(/List of competitions/i)).toBeInTheDocument();
  });

  test('redirects to /login when user is not authenticated', async () => {
    jest.spyOn(userHook, 'useUser').mockReturnValue({
      user: null,
      loading: false,
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });
  });

  test('shows loading message while checking auth', () => {
    jest.spyOn(userHook, 'useUser').mockReturnValue({
      user: null,
      loading: true,
    });

    render(<Dashboard />);

    expect(screen.getByText(/Checking authentication/i)).toBeInTheDocument();
  });
});
