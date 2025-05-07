import { render, screen, fireEvent } from '@testing-library/react';
import SignUpPage from '../pages/signup';
import * as authModule from '@/lib/auth';
import { useRouter } from 'next/router';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/lib/firebase');

describe('SignUpPage', () => {
  const push = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push });
    jest.spyOn(authModule, 'signUp').mockResolvedValue({ uid: 'test-user-id' } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the sign up form and submits correctly', async () => {
    render(<SignUpPage />);

    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Hari' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'hari@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'secret' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    // Wait for mock async signUp call
    expect(await authModule.signUp).toHaveBeenCalledWith('hari@example.com', 'secret', 'Hari');
    expect(push).toHaveBeenCalledWith('/dashboard');
  });
});
