import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@/hooks/useUser";
import { loadCompetitionData } from "@/lib/loadCompetitionData";
import Layout from "@/components/Layout";
import PlayerList from "@/components/PlayerList";
import { assignPlayer } from "@/lib/assignments";
import toast from "react-hot-toast";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
  const [locked, setLocked] = useState(false);

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

  const handleLockCompetition = async () => {
    if (!id || typeof id !== "string") return;
    await updateDoc(doc(db, "competitions", id), { isLocked: true });
    toast.success("Competition locked!");
    setLocked(true);
  };

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
        <button
          onClick={handleLockCompetition}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Lock Competition
        </button>
      )}

      {isAdmin && (
        <>
          <p className="mb-4 text-sm text-gray-600">
            Assign players to fantasy teams:
          </p>

          {locked ? (
            <p className="text-red-600 font-medium">
              Competition is locked. No further assignments allowed.
            </p>
          ) : (
            <PlayerList
              players={players}
              members={members}
              assignments={assignments}
              onAssign={async (playerId, memberId) => {
                if (!id || typeof id !== "string") return;

                const promise = assignPlayer(id, playerId, memberId);
                toast.promise(promise, {
                  loading: "Assigning...",
                  success: "✅ Player assigned!",
                  error: "❌ Failed to assign player.",
                });

                await promise;
              }}
            />
          )}
        </>
      )}
    </Layout>
  );
}
