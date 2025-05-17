import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { format } from "date-fns";
import { CURRENT_SEASON } from "../src/lib/constants"; // ✅ Use relative path

// Load Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, "../serviceAccountKey.json");
if (!fs.existsSync(serviceAccountPath)) {
  throw new Error("❌ Missing serviceAccountKey.json");
}

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
});

const db = admin.firestore();
const TODAY = format(new Date(), "yyyy-MM-dd");

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`❌ HTTP error: ${res.status}`);
  return res.json();
}

async function fetchPlayerPoints() {
  const liveVersion = format(new Date(), "MMddyyyyHHmmss");
  const fixturesUrl = `https://fantasy.iplt20.com/classic/api/feed/tour-fixtures?lang=en&liveVersion=${liveVersion}`;
  const fixtureData = await fetchJson(fixturesUrl);
  const fixtures = fixtureData?.Data?.Value;

  fixtures.sort(
    (a: any, b: any) =>
      new Date(b.MatchdateTime).getTime() - new Date(a.MatchdateTime).getTime()
  );

  const latestMatch = fixtures.find(
    (m: any) => m.MatchStatus === 2 || m.IsLive !== 0
  );
  if (!latestMatch) throw new Error("No valid match found.");

  const tourGamedayId = latestMatch.TourGamedayId;
  console.log(`🎯 TourGamedayId: ${tourGamedayId}`);

  const gamedayUrl = `https://fantasy.iplt20.com/classic/api/feed/gamedayplayers?lang=en&tourgamedayId=${tourGamedayId}`;
  const gamedayData = await fetchJson(gamedayUrl);
  const players = gamedayData?.Data?.Value?.Players;

  if (!players) throw new Error("Invalid player data response");

  for (const player of players) {
    const playerId = String(player.Id);
    const name = player.Name;
    const points = player.OverallPoints;

    const playerRef = db.doc(
      `seasons/${CURRENT_SEASON}/playerPoints/${playerId}`
    );
    const historyRef = playerRef.collection("history").doc(TODAY);

    // ✅ Upsert player base info
    await playerRef.set({ name }, { merge: true });

    // ✅ Write today's score to history
    await historyRef.set({ totalPoints: points });

    console.log(`✅ Updated ${name} (${playerId}) — ${points} pts`);
  }

  console.log("🚀 Player point update complete!");
}

fetchPlayerPoints().catch((err) => {
  console.error("❌ Failed to update player points:", err);
});
