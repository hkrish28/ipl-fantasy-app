import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useUser } from '@/hooks/useUser';
import { logOut } from '@/lib/auth';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, loading } = useUser();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/join', label: 'Join' },
    { href: '/create', label: 'Create' },
  ];

  const isActive = (href: string) => router.pathname === href;

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <header className="bg-gray-200 shadow">
        <div className="container mx-auto px-4 py-3 flex items-center">
          <Link href="/dashboard" className="text-lg font-semibold text-indigo-600">
            IPL Fantasy
          </Link>
          {/* Desktop Nav */}
          <nav className="hidden md:flex ml-8 space-x-6 text-sm font-medium">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`hover:text-indigo-500 ${isActive(href) ? 'underline text-indigo-600' : ''}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Logout for desktop */}
          {!loading && user && (
            <button
              onClick={logOut}
              className="hidden md:block text-red-600 hover:underline text-sm font-medium"
            >
              Log Out
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden ml-auto focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="h-6 w-6 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  mobileMenuOpen
                    ? 'M6 18L18 6M6 6l12 12'
                    : 'M4 6h16M4 12h16M4 18h16'
                }
              />
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden bg-gray-100">
            <div className="px-4 py-4 space-y-4">
              {navItems.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`block hover:text-indigo-500 ${isActive(href) ? 'underline text-indigo-600' : ''}`}
                >
                  {label}
                </Link>
              ))}
              {!loading && user && (
                <button
                  onClick={logOut}
                  className="w-full text-left text-red-600 hover:underline"
                >
                  Log Out
                </button>
              )}
            </div>
          </nav>
        )}
      </header>

      <main className="flex-grow container mx-auto px-4 py-6">{children}</main>

      <footer className="bg-gray-100 py-4 text-center text-sm text-gray-600">
        &copy; {new Date().getFullYear()} IPL Fantasy
      </footer>
    </div>
  );
}
