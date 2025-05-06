import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

export default function ManageCompetition() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Layout>
      <h1 className="text-xl font-bold">Manage Competition: {id}</h1>
      <p className="text-gray-600">Assign players, lock joins, and mark ongoing.</p>
    </Layout>
  );
}
