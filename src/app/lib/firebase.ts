import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB23cksTnpYApJy_3UHyvzn67Z8dKreOUs",
  authDomain: "prandan-7c28b.firebaseapp.com",
  projectId: "prandan-7c28b",
  storageBucket: "prandan-7c28b.firebasestorage.app",
  messagingSenderId: "13315913264",
  appId: "1:13315913264:web:6a75a657579407e8dfdff5",
  measurementId: "G-8XQXDNNSWX"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;