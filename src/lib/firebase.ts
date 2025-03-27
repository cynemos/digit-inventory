import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDSDfP4WMFVSxTucqPX39YkULKL6hZczro",
  authDomain: "digit-inventory.firebaseapp.com",
  projectId: "digit-inventory",
  storageBucket: "digit-inventory.firebasestorage.app",
  messagingSenderId: "965175577434",
  appId: "1:965175577434:web:939104e0a569471af7c163"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
