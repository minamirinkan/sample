// firebase.ts

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth"; // ← これが必要

const firebaseConfig = {
    apiKey: "AIzaSyCAlEUW3KxQbXHVWEZ_W57d4OqgYS6KCJw",
    authDomain: "class-scheduler-82c49.firebaseapp.com",
    projectId: "class-scheduler-82c49",
    storageBucket: "class-scheduler-82c49.firebasestorage.app",
    messagingSenderId: "356761532861",
    appId: "1:356761532861:web:db98eab6106d2d5b5ffad4",
    measurementId: "G-XN40PXGKPW"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app); // ← auth を取得

export { db, storage, auth }; // ← ここで auth を追加
