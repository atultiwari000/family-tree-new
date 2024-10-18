import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_REACT_APP_FIREBASE_API_KEY,
  authDomain: "family-tree-1efb3.firebaseapp.com",
  projectId: "family-tree-1efb3",
  storageBucket: "family-tree-1efb3.appspot.com",
  messagingSenderId: "86253009427",
  appId: "1:86253009427:web:0ad04b323ac3f97f429de6",
  measurementId: "G-P7Q5JJ3JX8"
};

console.log(firebaseConfig)

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);


export default firebaseConfig;