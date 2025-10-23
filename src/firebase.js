import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAnfBNiRrCKCJBj941QhEIpe2LS2s64Gm8",
  authDomain: "ai-ngredient.firebaseapp.com",
  projectId: "ai-ngredient",
  storageBucket: "ai-ngredient.firebasestorage.app",
  messagingSenderId: "765586166535",
  appId: "1:765586166535:web:9fdf996c1e1e5295162ba2",
  measurementId: "G-ZKW8FSJ5W5",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
