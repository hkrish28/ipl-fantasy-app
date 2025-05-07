jest.mock('@/lib/firebase'); // Prevent real Firebase from initializing

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../pages/login';
import * as authModule from '@/lib/auth';
import mockRouter from 'next-router-mock';

describe('LoginPage', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/login');
    mockRouter.push = jest.fn();

    jest
      .spyOn(authModule, 'logIn')
      .mockResolvedValue({ uid: 'mock-user-id' } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form and submits with credentials', async () => {
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'hari@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'secret' },
    });

    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(authModule.logIn).toHaveBeenCalledWith('hari@example.com', 'secret');
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  });
});
