import { useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/hooks/useUser';
import { createCompetition } from '@/lib/competitions';
import Layout from '@/components/Layout';

export default function CreateCompetitionPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [name, setName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');

  if (!loading && !user) {
    if (typeof window !== 'undefined') router.push('/login');
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    try {
      const id = await createCompetition(name, user.uid, teamName.trim() || 'My Team');
      router.push(`/competition/${id}`);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <Layout>
      <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-6 space-y-4">
        <h1 className="text-xl font-bold">Create a Competition</h1>

        <input
          className="w-full border p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Competition Name"
          required
        />

        <input
          className="w-full border p-2"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Your Team Name"
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button className="w-full bg-blue-600 text-white py-2 rounded" type="submit">
          Create
        </button>
      </form>
    </Layout>
  );
}
