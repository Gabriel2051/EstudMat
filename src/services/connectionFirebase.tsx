// services/connectionFirebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore"; // import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyDQrA4Ijf9tedwKsyV01ax3p9SADKlvoss",
  authDomain: "projetoboer-d1814.firebaseapp.com",
  databaseURL: "https://projetoboer-d1814-default-rtdb.firebaseio.com",
  projectId: "projetoboer-d1814",
  storageBucket: "projetoboer-d1814.appspot.com",
  messagingSenderId: "616346792981",
  appId: "1:616346792981:web:f37ba30413a62058370a1c"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);
export const db = getFirestore(app);  // <-- exporta Firestore também

export default app;
