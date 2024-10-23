// Copy and paste these scripts into the bottom of your <body> tag, but before you use any Firebase services:

// <script type="module">
//     // Import the functions you need from the SDKs you need
//     import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
//     // TODO: Add SDKs for Firebase products that you want to use
//     // https://firebase.google.com/docs/web/setup#available-libraries
  
//     // Your web app's Firebase configuration
//     const firebaseConfig = {
//       apiKey: "AIzaSyDyYJxjK1AtM01msUxUSqGHlaz9wrBSGzs",
//       authDomain: "snackshack-c06ac.firebaseapp.com",
//       projectId: "snackshack-c06ac",
//       storageBucket: "snackshack-c06ac.appspot.com",
//       messagingSenderId: "453222463950",
//       appId: "1:453222463950:web:9e048f856d2443dd0e139f"
//     };
  
//     // Initialize Firebase
//     const app = initializeApp(firebaseConfig);
//   </script>

import firebase from 'firebase/app'; 
import 'firebase/database';
import 'firebase/auth';
import "firebase/compat/storage"; 


const firebaseConfig = {
  apiKey: "AIzaSyDyYJxjK1AtM01msUxUSqGHlaz9wrBSGzs",
  authDomain: "snackshack-c06ac.firebaseapp.com",
  projectId: "snackshack-c06ac",
  storageBucket: "snackshack-c06ac.appspot.com",
  messagingSenderId: "453222463950",
  appId: "1:453222463950:web:9e048f856d2443dd0e139f"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();
// Initialize Cloud Storage and get a reference to the service
const storage = firebase.storage();
export { database, auth , storage};

