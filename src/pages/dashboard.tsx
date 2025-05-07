import Layout from '@/components/Layout';
import { useUser } from '@/hooks/useUser';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <Layout>
        <p className="text-gray-600">Checking authentication...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-xl font-bold">Your Competitions</h1>
      <p className="text-gray-600">List of competitions will appear here.</p>
    </Layout>
  );
}
