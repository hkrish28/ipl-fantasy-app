import { useState } from 'react';
import { useRouter } from 'next/router';
import { joinCompetition } from '@/lib/competitions';
import { useUser } from '@/hooks/useUser';
import Layout from '@/components/Layout';

export default function JoinPage() {
  const [code, setCode] = useState('');
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, loading } = useUser();

  if (!loading && !user) {
    if (typeof window !== 'undefined') router.push('/login');
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const compId = await joinCompetition(
        code.trim().toUpperCase(),
        user!.uid,
        teamName.trim() || 'Unnamed Team'
      );
      router.push(`/competition/${compId}`);
    } catch (err: any) {
      setError(err.message || 'Unable to join competition.');
    }
  }

  return (
    <Layout>
      <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-6 space-y-4">
        <h1 className="text-xl font-bold">Join a Competition</h1>

        <input
          className="w-full border p-2"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Invite Code"
          required
        />

        <input
          className="w-full border p-2"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Your Fantasy Team Name"
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
          Join
        </button>
      </form>
    </Layout>
  );
}
