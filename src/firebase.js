import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC3WxePJHcbBMwlem3p5iBwa-U0tk5MFlw",
  authDomain: "intro-to-swe-project.firebaseapp.com",
  projectId: "intro-to-swe-project",
  storageBucket: "intro-to-swe-project.firebasestorage.app",
  messagingSenderId: "617913146037",
  appId: "1:617913146037:web:a83369599a86a5c6114174",
  measurementId: "G-4RVR9BNYD2",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
