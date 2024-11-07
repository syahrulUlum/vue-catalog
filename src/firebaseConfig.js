import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDQmWIJzdhmNElqErdf1UwQ7QsECq4eIbM",
  authDomain: "vue-catalog-f8ab4.firebaseapp.com",
  projectId: "vue-catalog-f8ab4",
  storageBucket: "vue-catalog-f8ab4.firebasestorage.app",
  messagingSenderId: "823571673809",
  appId: "1:823571673809:web:65ec95a4aff61b87f7cbf0",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
