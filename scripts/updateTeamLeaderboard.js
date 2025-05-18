const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');
const { CURRENT_SEASON } = require('./constantsForScripts');

const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  throw new Error('❌ Missing serviceAccountKey.json');
}

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
});

const db = admin.firestore();
const TODAY = format(new Date(), 'yyyy-MM-dd');

async function getLatestPlayerPoints() {
  const snapshot = await db.collection(`seasons/${CURRENT_SEASON}/playerPoints`).get();
  const pointsMap = {};

  for (const doc of snapshot.docs) {
    const historyRef = doc.ref.collection('history');
    const latestSnap = await historyRef.orderBy('__name__', 'desc').limit(1).get();
    const latest = latestSnap.docs[0];
    if (latest?.exists) {
      pointsMap[doc.id] = latest.data().totalPoints || 0;
    }
  }

  return pointsMap;
}

async function updateLeaderboard() {
  const competitionsSnap = await db.collection(`seasons/${CURRENT_SEASON}/competitions`).get();
  const playerPoints = await getLatestPlayerPoints();

  for (const compDoc of competitionsSnap.docs) {
    const compId = compDoc.id;

    const assignmentsSnap = await db
      .collection(`seasons/${CURRENT_SEASON}/competitions/${compId}/assignments`)
      .get();

    const teamTotals = {};

    assignmentsSnap.forEach((doc) => {
      const playerId = doc.id;
      const teamId = doc.data().assignedTo;
      const points = playerPoints[playerId] || 0;

      if (!teamTotals[teamId]) teamTotals[teamId] = 0;
      teamTotals[teamId] += points;
    });

    for (const [teamId, total] of Object.entries(teamTotals)) {
      const ref = db.doc(`seasons/${CURRENT_SEASON}/competitions/${compId}/leaderboard/${teamId}/history/${TODAY}`);
      await ref.set({ totalPoints: total });
      console.log(`✅ ${compId} - ${teamId}: ${total} pts`);
    }
  }

  console.log('🎯 Leaderboard update complete');
}

updateLeaderboard().catch((err) => {
  console.error('❌ Failed to update leaderboard:', err);
});
