import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import { logOut } from '@/lib/auth';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();

  return (
    <div className="min-h-screen bg-white text-black">
      <nav className="bg-gray-200 p-4 flex gap-6 text-sm font-medium">
        <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        <Link href="/join" className="hover:underline">Join</Link>
        <Link href="/create" className="hover:underline">Create</Link>

        {!loading && user && (
          <button onClick={logOut} className="ml-auto text-red-600 hover:underline">
            Log Out
          </button>
        )}
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
