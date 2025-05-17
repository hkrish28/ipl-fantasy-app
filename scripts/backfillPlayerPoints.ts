import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { format, parse } from 'date-fns';
import { CURRENT_SEASON } from '../src/lib/constants';

const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  throw new Error('❌ Missing serviceAccountKey.json');
}

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
});

const db = admin.firestore();

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`❌ HTTP error: ${res.status}`);
  return res.json();
}

async function backfillPlayerPoints() {
  const liveVersion = format(new Date(), 'MMddyyyyHHmmss');
  const fixturesUrl = `https://fantasy.iplt20.com/classic/api/feed/tour-fixtures?lang=en&liveVersion=${liveVersion}`;
  const fixtureData = await fetchJson(fixturesUrl);
  const fixtures = fixtureData?.Data?.Value;

  if (!fixtures || !Array.isArray(fixtures)) {
    throw new Error('❌ Invalid fixture data');
  }

  // Sort descending by MatchdateTime
  fixtures.sort((a: any, b: any) =>
    new Date(b.MatchdateTime).getTime() - new Date(a.MatchdateTime).getTime()
  );

  let lastProcessedDate = '';
  for (const match of fixtures) {
    if (match.MatchStatus !== 2) continue; // Only completed matches

    const matchDate = format(parse(match.Matchdate, 'yyyy-MM-dd', new Date()), 'yyyy-MM-dd');
    if (matchDate === lastProcessedDate) continue;

    const sampleRef = db.collection(`seasons/${CURRENT_SEASON}/playerPoints`).doc('65748').collection('history').doc(matchDate);
    const exists = await sampleRef.get().then((doc) => doc.exists);
    if (exists) {
      console.log(`⏩ Skipping ${matchDate} (already exists)`);
      continue;
    }

    const tourGamedayId = match.TourGamedayId;
    const gamedayUrl = `https://fantasy.iplt20.com/classic/api/feed/gamedayplayers?lang=en&tourgamedayId=${tourGamedayId}`;
    const gamedayData = await fetchJson(gamedayUrl);
    const players = gamedayData?.Data?.Value?.Players;

    if (!players) {
      console.warn(`⚠️ Skipping TourGamedayId ${tourGamedayId} — no player data`);
      continue;
    }

    for (const player of players) {
      const playerId = String(player.Id);
      const points = player.OverallPoints;
      const ref = db.doc(`seasons/${CURRENT_SEASON}/playerPoints/${playerId}/history/${matchDate}`);
      await ref.set({ points });
    }

    console.log(`✅ Saved ${players.length} players for ${matchDate}`);
    lastProcessedDate = matchDate;
  }

  console.log('🎯 Backfill complete');
}

backfillPlayerPoints().catch((err) => {
  console.error('❌ Backfill failed:', err);
});
