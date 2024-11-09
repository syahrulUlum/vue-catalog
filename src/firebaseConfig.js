import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBPDaE_QxUc20-U6iG6-NSFOFymPO86yNM",
  authDomain: "vue-firebase-d6ef1.firebaseapp.com",
  projectId: "vue-firebase-d6ef1",
  storageBucket: "vue-firebase-d6ef1.appspot.com",
  messagingSenderId: "223095008535",
  appId: "1:223095008535:web:be7118472bcd0ac1489b52"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
