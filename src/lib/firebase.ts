import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAIcGfosgdYSbhN9AfsTfhJt0aSx-_XTdM",
  authDomain: "love-da-code.firebaseapp.com",
  projectId: "love-da-code",
  storageBucket: "love-da-code.firebasestorage.app",
  messagingSenderId: "610994141227",
  appId: "1:610994141227:web:acba46a0bc50bfcaa0d26e",
  measurementId: "G-V88769FQ3Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };