import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAehpM3_izn93YGJpdozIZjHtMH0btw8Iw",
  authDomain: "cerberusdb-2620a.firebaseapp.com",
  projectId: "cerberusdb-2620a",
  storageBucket: "cerberusdb-2620a.appspot.com",
  messagingSenderId: "807962592023",
  appId: "1:807962592023:web:d7463997e1176361e5ed52",
  measurementId: "G-QSWZC0V65C"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
