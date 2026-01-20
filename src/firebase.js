// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

// ===== Your Firebase Config =====
const firebaseConfig = {
  apiKey: "AIzaSyAp9REUlJer4o_PkyaEmOm9MvA3eZaKP38",
  authDomain: "kyu-lost-and-found.firebaseapp.com",
  projectId: "kyu-lost-and-found",
  storageBucket: "kyu-lost-and-found.appspot.com",
  messagingSenderId: "296436293713",
  appId: "1:296436293713:web:f20cf00986665b7809d870",
  measurementId: "G-NMHQZN3RMW",
};

// ===== Initialize Firebase =====
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ===== Helper Functions =====

// Upload image to Firebase Storage
export const uploadImage = async (file) => {
  if (!file) return null;
  const storageRef = ref(storage, `images/${Date.now()}-${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
};

// Add document to Firestore
export const addDocument = async (collectionName, dataObject) => {
  const docRef = await addDoc(collection(db, collectionName), dataObject);
  return docRef.id;
};

// Fetch collection from Firestore
export const fetchCollection = async (collectionName) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Update document in Firestore
export const updateDocument = async (collectionName, docId, dataObject) => {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, dataObject);
};

export { db, analytics, storage };