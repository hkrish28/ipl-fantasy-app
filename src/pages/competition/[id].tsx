import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

export default function CompetitionPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Layout>
      <h1 className="text-xl font-bold">Competition: {id}</h1>
      <p className="text-gray-600">View team and leaderboard here.</p>
    </Layout>
  );
}
