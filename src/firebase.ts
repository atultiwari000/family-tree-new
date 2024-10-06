import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCGfpz6pgp4N-twDhbNjdlJLExxiH2TK58",
  authDomain: "family-tree-72775.firebaseapp.com",
  projectId: "family-tree-72775",
  storageBucket: "family-tree-72775.appspot.com",
  messagingSenderId: "527666511066",
  appId: "1:527666511066:web:c694dfadfbcb754a0d39e3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);