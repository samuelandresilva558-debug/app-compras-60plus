import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Suas configurações reais do Firebase Console:
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: "app-idosos-60plus.firebaseapp.com",
  projectId: "app-idosos-60plus",
  storageBucket: "app-idosos-60plus.firebasestorage.app",
  messagingSenderId: "393685778976",
  appId: "1:393685778976:web:cdd079ee02250f9d4d3245"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Banco de Dados (Firestore)
export const db = getFirestore(app);
