import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };
