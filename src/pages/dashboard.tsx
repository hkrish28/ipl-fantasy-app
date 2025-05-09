import Layout from '@/components/Layout';
import { useUser } from '@/hooks/useUser';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { collectionGroup, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';


export default function Dashboard() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [competitions, setCompetitions] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && user) {
      const fetchUserCompetitions = async () => {
        const memberDocs = await getDocs(
          collectionGroup(db, 'members')
        );
  
        const userMemberships = memberDocs.docs.filter(doc => doc.id === user.uid);
  
        const competitionPromises = userMemberships.map(async (docSnap) => {
          const competitionId = docSnap.ref.parent.parent?.id;
          const competitionDoc = await getDoc(doc(db, 'competitions', competitionId!));
          return { id: competitionId, ...competitionDoc.data() };
        });
  
        const competitions = await Promise.all(competitionPromises);
        setCompetitions(competitions);
      };
  
      fetchUserCompetitions();
    }
  }, [user, loading]);
  
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
      <h1 className="text-xl font-bold mb-4">Your Competitions</h1>
{competitions.length === 0 ? (
  <p className="text-gray-600">You're not part of any competitions yet.</p>
) : (
  <ul className="space-y-2">
    {competitions.map((comp) => (
      <li key={comp.id} className="border p-3 rounded shadow-sm">
        <p className="font-semibold">{comp.name}</p>
        <p className="text-sm text-gray-500">Status: {comp.isLocked ? 'Ongoing' : 'Setup'}</p>
      </li>
    ))}
  </ul>
)}

    </Layout>
  );
}
