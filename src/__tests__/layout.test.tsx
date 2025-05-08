import { render, screen, fireEvent } from '@testing-library/react';
import Layout from '@/components/Layout';
import * as userHook from '@/hooks/useUser';
import * as authModule from '@/lib/auth';

jest.mock('@/lib/firebase'); // prevent real Firebase init

describe('Layout Navigation', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders logout button when user is authenticated', () => {
    jest.spyOn(userHook, 'useUser').mockReturnValue({
      user: { uid: 'user123' } as any,
      loading: false,
    });

    render(
      <Layout>
        <p>Test content</p>
      </Layout>
    );

    expect(screen.getByText('Log Out')).toBeInTheDocument();
  });

  test('calls logOut function when logout button is clicked', () => {
    const logoutSpy = jest.spyOn(authModule, 'logOut').mockResolvedValue();

    jest.spyOn(userHook, 'useUser').mockReturnValue({
      user: { uid: 'user123' } as any,
      loading: false,
    });

    render(
      <Layout>
        <p>Test content</p>
      </Layout>
    );

    fireEvent.click(screen.getByText('Log Out'));
    expect(logoutSpy).toHaveBeenCalled();
  });

  test('does not show logout when user is not authenticated', () => {
    jest.spyOn(userHook, 'useUser').mockReturnValue({
      user: null,
      loading: false,
    });

    render(
      <Layout>
        <p>Test content</p>
      </Layout>
    );

    expect(screen.queryByText('Log Out')).not.toBeInTheDocument();
  });
});
