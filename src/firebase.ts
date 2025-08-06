// src/firebase.ts

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase設定
const firebaseConfig = {
  apiKey: 'AIzaSyCAlEUW3KxQbXHVWEZ_W57d4OqgYS6KCJw',
  authDomain: 'class-scheduler-82c49.firebaseapp.com',
  projectId: 'class-scheduler-82c49',
  storageBucket: 'class-scheduler-82c49.firebasestorage.app',
  messagingSenderId: '356761532861',
  appId: '1:356761532861:web:db98eab6106d2d5b5ffad4',
  measurementId: 'G-XN40PXGKPW'
};

// Firebase初期化
const app = initializeApp(firebaseConfig);

// Firebaseサービス取得
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// 型付きでエクスポート
export { auth, provider, db };
