const admin = require('firebase-admin');
const playerData = require('./players.json');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Load service account
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  throw new Error('❌ Missing serviceAccountKey.json');
}

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
});

const db = admin.firestore();

// Role normalization map
const roleMap: Record<string, string> = {
  'BATSMAN': 'Batsman',
  'BOWLER': 'Bowler',
  'ALL ROUNDER': 'All-Rounder',
  'WICKET KEEPER': 'WK',
};

// Set the target season ID
const SEASON_ID = '2025';

// Confirm prompt
function askConfirmation(): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      `⚠️  This will upload all players to Firestore under seasons/${SEASON_ID}/players. Are you sure? (yes/no): `,
      (answer: string) => {
        rl.close();
        resolve(answer.toLowerCase().trim() === 'yes');
      }
    );
  });
}

async function uploadPlayers() {
  const confirmed = await askConfirmation();
  if (!confirmed) {
    console.log('❌ Upload cancelled.');
    process.exit(0);
  }

  const players = playerData.Data.Value.Players;

  for (const player of players) {
    const id = String(player.Id);
    const name = player.Name;
    const skillKey = player.SkillName as keyof typeof roleMap;
    const role = roleMap[skillKey] || player.SkillName;
    const team = player.TeamShortName;

    const playerDoc = {
      name,
      role,
      team,
    };

    try {
      await db
        .collection('seasons')
        .doc(SEASON_ID)
        .collection('players')
        .doc(id)
        .set(playerDoc);
      console.log(`✅ Uploaded: ${name}`);
    } catch (err) {
      console.error(`❌ Error uploading ${name}:`, err);
    }
  }

  console.log('🎉 Upload complete!');
}

uploadPlayers();
