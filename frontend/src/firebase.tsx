import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBH3CnSyr7t6cX6v8YiPsQ9YF7Xrm4kcdQ",
  authDomain: "techmate-b4bdb.firebaseapp.com",
  projectId: "techmate-b4bdb",
  storageBucket: "techmate-b4bdb.firebasestorage.app",
  messagingSenderId: "764036810802",
  appId: "1:764036810802:web:a108793f238745104e542b",
  measurementId: "G-G9DYHT0KBN"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);