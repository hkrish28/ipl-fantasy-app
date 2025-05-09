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

---

### 2. Add Firebase Admin Credentials

Go to your Firebase Console → Project Settings → **Service Accounts**  
Click **“Generate new private key”** and save it as:

```
serviceAccountKey.json
```

> ⚠️ Important: Add this to your `.gitignore` file:

```
/serviceAccountKey.json
```

---

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
/players/{playerId}
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

- **Next.js** – Full-stack React framework
- **Firebase** – Auth & Firestore
- **Tailwind CSS** – Styling
- **Jest** + **React Testing Library** – Unit & integration tests

---

## ✅ Development Notes

- Each feature is committed incrementally with clear test coverage
- All critical Firebase logic (auth, DB) is abstracted under `/lib`
- The app is being built with MVP → production readiness in mind
