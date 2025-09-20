import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyASzZueOosfcdTUga4JBqJNvy67C9GZGqk",
  authDomain: "community-3ad75.firebaseapp.com",
  projectId: "community-3ad75",
  storageBucket: "community-3ad75.firebasestorage.app",
  messagingSenderId: "340780962358",
  appId: "1:340780962358:web:f2b87f9183a223dba2be97",
  measurementId: "G-GDVCRK9QDC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, analytics, db, auth, storage };
