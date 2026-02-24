import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBYdsVXL01KDRoCqLS8hQeRv67Q_-gUV_E",
  authDomain: "garden-planner-5a481.firebaseapp.com",
  projectId: "garden-planner-5a481",
  storageBucket: "garden-planner-5a481.firebasestorage.app",
  messagingSenderId: "277705939589",
  appId: "1:277705939589:web:3c3bb074469f90e435a7ec",
  measurementId: "G-D69MVM7NCK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Auth Helper Functions
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logOut = () => signOut(auth);