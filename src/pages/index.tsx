import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useUser();
  const router = useRouter();

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <h1 className="text-4xl font-bold mb-6 text-blue-700">IPL Fantasy</h1>
      <p className="text-gray-600 text-center max-w-md mb-10">
        Build your fantasy IPL team, compete with friends, and track points in real-time.
      </p>

      {!user ? (
        <div className="flex gap-4">
          <Link
            href="/login"
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="bg-gray-200 text-gray-800 px-5 py-2 rounded hover:bg-gray-300"
          >
            Sign Up
          </Link>
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-4 text-green-700 font-medium">
            Welcome back, {user.email}!
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
