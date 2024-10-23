// Copy and paste these scripts into the bottom of your <body> tag, but before you use any Firebase services:
  
//     // Initialize Firebase
//     const app = initializeApp(firebaseConfig);
//   </script>



// need to run npm install firebase@latest
// When using services in the components, import them using:
// import { database, auth, storage } from '@/firebase';

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDyYJxjK1AtM01msUxUSqGHlaz9wrBSGzs",
  authDomain: "snackshack-c06ac.firebaseapp.com",
  projectId: "snackshack-c06ac",
  storageBucket: "snackshack-c06ac.appspot.com",
  messagingSenderId: "453222463950",
  appId: "1:453222463950:web:9e048f856d2443dd0e139f"
};

// const firestore = firebase.initializeApp(firebaseConfig);
// const db = firestore.firestore();
// export default db;


// //Initialize Firebase
const app = initializeApp(firebaseConfig);
// //Initialize services
const db = getFirestore(app);
const auth = getAuth(app);
// Initialize Cloud Storage and get a reference to the service
const storage = getStorage(app);
export { db, auth ,storage};

