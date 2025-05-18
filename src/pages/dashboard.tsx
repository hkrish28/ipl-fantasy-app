import Layout from '@/components/Layout';
import { useUser } from '@/hooks/useUser';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { CURRENT_SEASON } from '@/lib/constants';

export default function Dashboard() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [competitions, setCompetitions] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchCompetitions = async () => {
      const comps: any[] = [];
      const seasonCompsSnap = await getDocs(collection(db, `seasons/${CURRENT_SEASON}/competitions`));

      for (const compSnap of seasonCompsSnap.docs) {
        const membersRef = collection(db, `seasons/${CURRENT_SEASON}/competitions/${compSnap.id}/members`);
        const membersSnap = await getDocs(membersRef);
        const isMember = membersSnap.docs.some((m) => m.id === user.uid);

        if (isMember) {
          const data = compSnap.data();
          comps.push({ id: compSnap.id, name: data.name, isLocked: data.isLocked });
        }
      }

      setCompetitions(comps);
    };

    fetchCompetitions();
  }, [user]);

  if (loading || !user) {
    return (
      <Layout>
        <p className="text-gray-600">Checking authentication...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">Your Competitions</h1>
      {competitions.length === 0 ? (
        <p className="text-gray-600">You are not part of any competitions yet.</p>
      ) : (
        <ul className="space-y-2">
          {competitions.map((comp) => (
            <li key={comp.id} className="border p-3 rounded shadow-sm">
              <Link href={`/competition/${comp.id}`} className="text-blue-600 hover:underline">
                <p className="font-semibold">{comp.name}</p>
                <p className="text-sm text-gray-500">Status: {comp.isLocked ? 'Ongoing' : 'Setup'}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}
