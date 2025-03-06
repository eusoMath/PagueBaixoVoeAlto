import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";



const firebaseConfig = {
    apiKey: "AIzaSyA_UGAa-oEn1nruQpdMtax1LgebMJxjGIM",
    authDomain: "voe-alto-pague-baixo.firebaseapp.com",
    projectId: "voe-alto-pague-baixo",
    storageBucket: "voe-alto-pague-baixo.firebasestorage.app",
    messagingSenderId: "558666320256",
    appId: "1:558666320256:web:801022c471379d2b3d5965"
  };
const app = initializeApp(firebaseConfig);

const Nome = document.getElementById("Nome").value;
const Email = document.getElementById("Email").value;
const Senha = document.getElementById("Senha").value;
const EmailLogin = document.getElementById("email").value;
const SenhaLogin = document.getElementById("senha").value;

const auth = getAuth();

createUserWithEmailAndPassword(auth, Email, Senha)
  .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // ..
  });

  signInWithEmailAndPassword(auth, EmailLogin, SenhaLogin)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
  });