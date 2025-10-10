const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// --- Firebase Configuration ---
// NOTE: This is copied from frontend/HabitForgeApp/firebase/config.ts
const firebaseConfig = {
  apiKey: "AIzaSyAbr65Lm0VNue7D2ZfK4kp_dY-VRdf6ioA",
  authDomain: "habitforge-aa973.firebaseapp.com",
  databaseURL: "https://habitforge-aa973-default-rtdb.firebaseio.com",
  projectId: "habitforge-aa973",
  storageBucket: "habitforge-aa973.firebasestorage.app",
  messagingSenderId: "55045108715",
  appId: "1:55045108715:web:8bf8e3312753410a739fae",
  measurementId: "G-QKW0SVTEL5"
};

// --- Script Logic ---

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const badgesFilePath = path.join(__dirname, '..', 'backend', 'badges.json');
const badgesCollectionRef = collection(db, 'badges');

async function uploadBadges() {
  try {
    console.log('Reading badges from badges.json...');
    const badgesFileContent = fs.readFileSync(badgesFilePath, 'utf8');
    const badges = JSON.parse(badgesFileContent);

    if (!Array.isArray(badges)) {
      throw new Error('badges.json is not a valid JSON array.');
    }

    console.log(`Found ${badges.length} badges. Starting upload to Firestore...`);

    for (const badge of badges) {
      if (!badge.id) {
        console.warn('Skipping a badge because it has no id:', badge);
        continue;
      }
      const badgeDocRef = doc(badgesCollectionRef, badge.id);
      await setDoc(badgeDocRef, badge);
      console.log(`  - Uploaded: ${badge.name} (ID: ${badge.id})`);
    }

    console.log('\n✅ Successfully uploaded all badges to Firestore!');
    console.log('You can now see the "badges" collection in your Firebase console.');

  } catch (error) {
    console.error('\n❌ Error uploading badges:', error);
    process.exit(1); // Exit with an error code
  }
}

uploadBadges().then(() => {
    // The script will exit automatically because there are no more async operations pending.
    // We call process.exit() in the catch block, but not here.
    // However, the Firestore client might keep the connection open.
    // It's better to explicitly exit.
    process.exit(0);
});
