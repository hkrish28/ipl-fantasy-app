import Link from 'next/link';
import Layout from '@/components/Layout';
import { useUser } from '@/hooks/useUser';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { CURRENT_SEASON } from '@/lib/constants';

interface Competition {
  id: string;
  name: string;
  isLocked: boolean;
}

export default function Dashboard() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [competitions, setCompetitions] = useState<Competition[]>([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  // Fetch user’s competitions
  useEffect(() => {
    if (!user) return;
    const fetchCompetitions = async () => {
      const comps: Competition[] = [];
      const seasonRef = collection(db, `seasons/${CURRENT_SEASON}/competitions`);
      const seasonSnap = await getDocs(seasonRef);

      for (const docSnap of seasonSnap.docs) {
        const membersRef = collection(
          db,
          `seasons/${CURRENT_SEASON}/competitions/${docSnap.id}/members`
        );
        const membersSnap = await getDocs(membersRef);
        const isMember = membersSnap.docs.some(m => m.id === user.uid);

        if (isMember) {
          const data = docSnap.data();
          comps.push({
            id: docSnap.id,
            name: data.name,
            isLocked: data.isLocked,
          });
        }
      }

      setCompetitions(comps);
    };

    fetchCompetitions();
  }, [user]);

  // Show spinner while auth state is resolving
  if (loading || !user) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-indigo-600"></div>
          <span className="ml-3 text-gray-600">Checking authentication…</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with Create button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
            Your Competitions
          </h1>
          <Link
            href="/create"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            + Create Competition
          </Link>
        </div>

        {/* No competitions */}
        {competitions.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            You’re not in any competitions yet.
            <br />
            <Link
              href="/join"
              className="text-indigo-600 hover:underline mt-2 inline-block"
            >
              Join one now →
            </Link>
          </div>
        ) : (
          /* Grid of competition cards */
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {competitions.map(comp => (
              <li
                key={comp.id}
                className="bg-white border border-gray-200 rounded-xl shadow hover:shadow-lg transition p-5"
              >
                <Link href={`/competition/${comp.id}`} className="block">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {comp.name}
                    </h2>
                    <span
                      className={
                        comp.isLocked
                          ? 'px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800'
                          : 'px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800'
                      }
                    >
                      {comp.isLocked ? 'Ongoing' : 'Setup'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">View details →</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
