// services/connectionFirebase.ts
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getDatabase } from "firebase/database"
import { CACHE_SIZE_UNLIMITED, enableIndexedDbPersistence, initializeFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDQrA4Ijf9tedwKsyV01ax3p9SADKlvoss",
  authDomain: "projetoboer-d1814.firebaseapp.com",
  databaseURL: "https://projetoboer-d1814-default-rtdb.firebaseio.com",
  projectId: "projetoboer-d1814",
  storageBucket: "projetoboer-d1814.appspot.com",
  messagingSenderId: "616346792981",
  appId: "1:616346792981:web:f37ba30413a62058370a1c",
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const database = getDatabase(app)

export const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
})

if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db, {
    forceOwnership: true,
  }).catch((err) => {
    if (err.code === "failed-precondition") {
      console.warn("Firestore: Múltiplas abas abertas, a persistência só pode ser habilitada em uma aba por vez.")
    } else if (err.code === "unimplemented") {
      console.warn("Firestore: O navegador atual não suporta persistência offline.")
    }
  })
}

export default app
