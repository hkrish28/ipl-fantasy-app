import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../pages/index';
import * as userHook from '@/hooks/useUser';

// Mock user hook
jest.mock('@/hooks/useUser');

describe('Home Page', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders guest homepage with CTA buttons', () => {
    (userHook.useUser as jest.Mock).mockReturnValue({ user: null, loading: false });

    render(<Home />);

    expect(screen.getByText('IPL Fantasy')).toBeInTheDocument();
    expect(screen.getByText(/Build your fantasy IPL team/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Log In' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign Up' })).toBeInTheDocument();
  });

  test('renders user greeting when logged in', () => {
    (userHook.useUser as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com' },
      loading: false,
    });

    render(<Home />);

    expect(screen.getByText('IPL Fantasy')).toBeInTheDocument();
    expect(screen.getByText(/Welcome back, test@example.com/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Go to Dashboard/i })).toBeInTheDocument();
  });
});
