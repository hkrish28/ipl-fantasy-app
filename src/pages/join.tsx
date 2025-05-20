import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { joinCompetition } from '@/lib/competitions';
import { useUser } from '@/hooks/useUser';
import Layout from '@/components/Layout';

export default function JoinPage() {
  const [code, setCode] = useState('');
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { user, loading } = useUser();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const compId = await joinCompetition(
        code.trim().toUpperCase(),
        user!.uid,
        teamName.trim() || 'Unnamed Team'
      );
      router.push(`/competition/${compId}`);
    } catch (err: any) {
      setError(err.message || 'Unable to join competition.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-10 p-6 bg-white border border-gray-200 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Join a Competition
        </h1>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Invite Code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Enter invite code"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
              Team Name
            </label>
            <input
              id="teamName"
              type="text"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              placeholder="Your fantasy team name"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className={`w-full flex justify-center items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition 
              ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {submitting ? (
              <svg
                className="animate-spin h-5 w-5 mr-3 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 00-12 12h4z"
                />
              </svg>
            ) : (
              'Join Competition'
            )}
          </button>
        </form>
      </div>
    </Layout>
  );
}
