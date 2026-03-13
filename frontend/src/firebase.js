import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Paste your Firebase config object here!
const firebaseConfig = {
  apiKey: "AIzaSyA2fefeahrJhXtCt63wkmSVbTICGjEmffM",
  authDomain: "procrastrack.firebaseapp.com",
  projectId: "procrastrack",
  storageBucket: "procrastrack.firebasestorage.app",
  messagingSenderId: "58136222108",
  appId: "1:58136222108:web:ea78fbda701f8a77419059"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
