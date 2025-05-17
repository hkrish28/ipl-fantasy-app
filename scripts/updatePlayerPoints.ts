const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
const { format, parse } = require("date-fns");
const { CURRENT_SEASON } = require('./constantsForScripts');


// Setup Firebase
const serviceAccountPath = path.join(__dirname, "../serviceAccountKey.json");
if (!fs.existsSync(serviceAccountPath)) {
  throw new Error("❌ Missing serviceAccountKey.json");
}

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
});

const db = admin.firestore();

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`❌ HTTP error: ${res.status}`);
  return res.json();
}

async function fetchPlayerPoints(): Promise<void> {
  const liveVersion = format(new Date(), "MMddyyyyHHmmss");
  const fixturesUrl = `https://fantasy.iplt20.com/classic/api/feed/tour-fixtures?lang=en&liveVersion=${liveVersion}`;
  const fixtureData = await fetchJson(fixturesUrl);
  const fixtures: any[] = fixtureData?.Data?.Value || [];

  fixtures.sort(
    (a: any, b: any) =>
      new Date(b.MatchdateTime).getTime() - new Date(a.MatchdateTime).getTime()
  );

  const latestMatch = fixtures.find(
    (m: any) => m.MatchStatus === 2 || m.IsLive !== 0
  );
  if (!latestMatch) throw new Error("No valid match found.");

  const matchTimestamp = parse(
    latestMatch.MatchdateTime,
    "MM/dd/yyyy HH:mm:ss",
    new Date()
  );
  const matchDateTimeKey = format(matchTimestamp, "yyyy-MM-dd");


  const tourGamedayId = latestMatch.TourGamedayId;
  console.log(`🎯 TourGamedayId: ${tourGamedayId}, Timestamp: ${matchDateTimeKey}`);

  const gamedayUrl = `https://fantasy.iplt20.com/classic/api/feed/gamedayplayers?lang=en&tourgamedayId=${tourGamedayId}`;
  const gamedayData = await fetchJson(gamedayUrl);
  const players: any[] = gamedayData?.Data?.Value?.Players;

  if (!players) throw new Error("Invalid player data response");

  for (const player of players) {
    const playerId: string = String(player.Id);
    const name: string = player.Name;
    const points: number = player.OverallPoints;

    const playerRef = db.doc(
      `seasons/${CURRENT_SEASON}/playerPoints/${playerId}`
    );
    const historyRef = playerRef.collection("history").doc(matchDateTimeKey);

    await playerRef.set({ name }, { merge: true });
    await historyRef.set({ totalPoints: points });

    console.log(`✅ Updated ${name} (${playerId}) — ${points} pts at ${matchDateTimeKey}`);
  }

  console.log("🚀 Player point update complete!");
}

fetchPlayerPoints().catch((err) => {
  console.error("❌ Failed to update player points:", err);
});
