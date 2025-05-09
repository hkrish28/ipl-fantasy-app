import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@/hooks/useUser";
import { loadCompetitionData } from "@/lib/loadCompetitionData";
import Layout from "@/components/Layout";
import PlayerList from "@/components/PlayerList";

interface Player {
  id: string;
  name: string;
  role: string;
  team: string;
}

interface Member {
  id: string;
  teamName: string;
}

export default function CompetitionPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const { id } = router.query;

  const [isAdmin, setIsAdmin] = useState(false);
  const [competitionName, setCompetitionName] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id || typeof id !== "string" || loading || !user) return;

    loadCompetitionData(id, user.uid, (map) => {
      setAssignments(map);
    }).then((data) => {
      if (!data) return;
      setCompetitionName(data.competitionName);
      setIsAdmin(data.isAdmin);
      setMembers(data.members);
      setPlayers(data.players);
    });
  }, [id, user, loading]);

  if (!user && !loading) {
    router.push("/login");
    return null;
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">
        Competition: {competitionName}
      </h1>

      {!isAdmin && (
        <p className="text-gray-500">
          You are not the admin of this competition.
        </p>
      )}

      {isAdmin && (
        <>
          <p className="mb-4 text-sm text-gray-600">
            Assign players to fantasy teams:
          </p>

          <PlayerList
            players={players}
            members={members}
            assignments={assignments}
            onAssign={(playerId, memberId) => {
              console.log(`Assigning ${playerId} to ${memberId}`);
              // 🔜 Replace with Firestore update via assignPlayer()
            }}
          />
        </>
      )}
    </Layout>
  );
}
