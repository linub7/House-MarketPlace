import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDFGDGDXCDqpQ50BcMfk-VYTmK1GQk0_Xw',
  authDomain: 'house-marketplace-d7e83.firebaseapp.com',
  projectId: 'house-marketplace-d7e83',
  storageBucket: 'house-marketplace-d7e83.appspot.com',
  messagingSenderId: '1030155243276',
  appId: '1:1030155243276:web:fb00b9edc4782af0464329',
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore();
