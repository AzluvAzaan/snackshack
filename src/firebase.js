import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

//Firebase Configuration (remember to change with your own firebase credentials)
const firebaseConfig = {
  apiKey: apiKey,
  authDomain: "snackshack-c06ac.firebaseapp.com",
  projectId: "snackshack-c06ac",
  storageBucket: "snackshack-c06ac.appspot.com",
  messagingSenderId: "453222463950",
  appId: "1:453222463950:web:9e048f856d2443dd0e139f"
};

// //Initialize Firebase
const app = initializeApp(firebaseConfig);
// //Initialize services
const db = getFirestore(app);
const auth = getAuth(app);
//Set persistence to browser session
setPersistence(auth, browserSessionPersistence)
// Initialize Cloud Storage and get a reference to the service
const storage = getStorage(app);
export { db, auth ,storage};

