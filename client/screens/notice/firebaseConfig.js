// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1dVX2HWGNbJTBk9OaqecRik5rH6iiX-M",
  authDomain: "blindspot-901d5.firebaseapp.com",
  projectId: "blindspot-901d5",
  storageBucket: "blindspot-901d5.appspot.com",
  messagingSenderId: "491636743045",
  appId: "1:491636743045:web:9e16682caf0601ab23c2ec",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { app, storage };
