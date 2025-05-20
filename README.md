# IPL Fantasy Web App

This is the starter codebase for the IPL Fantasy application, built using **Next.js**, **Firebase**, and **Tailwind CSS**.

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/ipl-fantasy-app.git
cd ipl-fantasy-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase

Create a `.env.local` file in the root and add your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Firestore Indexes

To support efficient sorting of player points and leaderboard history (for trends graphs), you must create composite indexes in the Firebase console or via `firestore indexes`:

1. **PlayerPoints history index**

   * Collection: `seasons/{seasonId}/players/{playerId}/history`
   * Fields:

     * `__name__` **DESC**
     * **No additional fields**
   * Query: `orderBy('__name__', 'desc').limit(7)`

2. **Leaderboard history index**

   * Collection: `seasons/{seasonId}/competitions/{competitionId}/leaderboard/{teamId}/history`
   * Fields:

     * `__name__` **DESC**
   * Query: `orderBy('__name__', 'desc').limit(2)`

You can create these via the **Indexes** tab in the Firebase console or by adding to `firestore.indexes.json` and running:

```bash
npx firebase deploy --only firestore:indexes
```

---

## 🔄 Seeding Player Data

You can populate the `players` collection in Firestore using a one-click upload script powered by the Firebase Admin SDK.

### 1. Add API Response Data

Save the IPL player API response in:

```
scripts/players.json
```

Example structure:

```json
{
  "Data": {
    "Value": {
      "Players": [
        {
          "Id": 123,
          "Name": "Virat Kohli",
          "SkillName": "BATSMAN",
          "TeamShortName": "RCB"
        }
      ]
    }
  }
}
```

> Only `name`, `role`, and `team` will be stored in Firestore.

### 2. Add Firebase Admin Credentials

Go to your Firebase Console → Project Settings → **Service Accounts**
Click **“Generate new private key”** and save it as:

```
serviceAccountKey.json
```

> ⚠️ Important: Add this to your `.gitignore`:

```
/serviceAccountKey.json
```

### 3. Run the Upload Script

```bash
npx ts-node scripts/uploadPlayersAdmin.ts
```

You’ll be prompted:

```
⚠️  This will upload all players to Firestore. Are you sure? (yes/no):
```

Type `yes` to proceed. Each player will be saved to:

```
seasons/{seasonId}/players/{playerId}
```

With this format:

```json
{
  "name": "Virat Kohli",
  "role": "Batsman",
  "team": "RCB"
}
```

---

## 🛠 Tech Stack

* **Next.js** – Full-stack React framework
* **Firebase** – Auth, Firestore, Cloud Functions
* **Tailwind CSS** – Styling
* **Recharts** – Charting
* **Jest** + **React Testing Library** – Unit & integration tests

---

## ✅ Development Notes

* Each feature is committed incrementally with clear test coverage.
* All critical Firebase logic (auth, DB) is abstracted under `/lib`.
* The app is built with MVP → production readiness in mind.
* **Firestore composite indexes** are required for history sorting.

---

## 🚧 Running in Production

1. Build the Next.js app:

   ```bash
   npm run build
   ```
2. Deploy to Vercel or Firebase Hosting.
3. Ensure **Firestore indexes** are live via the Firebase console.

---

Happy building your IPL Fantasy League! Feel free to raise issues or contribute.
