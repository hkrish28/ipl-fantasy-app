import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../pages/dashboard';
import * as userHook from '@/hooks/useUser';
import mockRouter from 'next-router-mock';
import { getDocs, collection } from 'firebase/firestore';

// ✅ Prevent real Firebase access
jest.mock('@/lib/firebase');

// ✅ Mock getDocs behavior
jest.mock('firebase/firestore', () => {
  const original = jest.requireActual('firebase/firestore');
  return {
    ...original,
    getDocs: jest.fn(),
    collection: jest.fn((...args) => args.join('/')), // simulate Firestore collection path string
  };
});

describe('Dashboard Page', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/dashboard');
    mockRouter.push = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard content when user is authenticated and in no competitions', async () => {
    jest.spyOn(userHook, 'useUser').mockReturnValue({
      user: { uid: 'user123' } as any,
      loading: false,
    });

    // Mock Firestore competitions and member docs
    (getDocs as jest.Mock).mockImplementation((path) => {
      if (typeof path === 'string' && path.includes('/members')) {
        return Promise.resolve({ docs: [] }); // no membership
      }
      return Promise.resolve({
        docs: [
          {
            id: 'comp1',
            data: () => ({ name: 'Mock League', isLocked: false }),
          },
        ],
      });
    });

    render(<Dashboard />);
    expect(await screen.findByText('Your Competitions')).toBeInTheDocument();
    expect(screen.getByText(/not part of any competitions/i)).toBeInTheDocument();
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
    expect(screen.getByText(/checking authentication/i)).toBeInTheDocument();
  });
});
