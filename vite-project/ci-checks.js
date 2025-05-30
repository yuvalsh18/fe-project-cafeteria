// ci-checks.js
// This script checks Firestore and Gemini API connectivity using env vars
// Removed dotenv: secrets are passed as env vars in CI

const { initializeApp, getApps } = require("firebase/app");
const { getFirestore, getDoc, doc } = require("firebase/firestore");
const fetch = require("node-fetch");

async function checkFirestore() {
  try {
    if (!process.env.VITE_FIREBASE_API_KEY)
      throw new Error("Missing Firebase API key");
    if (getApps().length === 0) {
      initializeApp({
        apiKey: process.env.VITE_FIREBASE_API_KEY,
        authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      });
    }
    const db = getFirestore();
    // Try to get a non-existing doc (should fail with not-found, but not with network error)
    await getDoc(doc(db, "__ci_check", "test"));
    console.log("Firestore connectivity: OK");
  } catch (e) {
    console.error("Firestore connectivity: FAILED", e.message);
    process.exit(1);
  }
}

async function checkGemini() {
  try {
    if (!process.env.VITE_GEMINI_API_KEY)
      throw new Error("Missing Gemini API key");
    // Example Gemini API endpoint (adjust if needed)
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models",
      {
        headers: { Authorization: `Bearer ${process.env.VITE_GEMINI_API_KEY}` },
      }
    );
    if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
    console.log("Gemini API connectivity: OK");
  } catch (e) {
    console.error("Gemini API connectivity: FAILED", e.message);
    process.exit(1);
  }
}

(async () => {
  await checkFirestore();
  await checkGemini();
})();
