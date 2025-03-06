  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
  import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

  const firebaseConfig = {
    apiKey: "AIzaSyA_UGAa-oEn1nruQpdMtax1LgebMJxjGIM",
    authDomain: "voe-alto-pague-baixo.firebaseapp.com",
    projectId: "voe-alto-pague-baixo",
    storageBucket: "voe-alto-pague-baixo.firebasestorage.app",
    messagingSenderId: "558666320256",
    appId: "1:558666320256:web:801022c471379d2b3d5965"
  };

  export const auth = getAuth()

  const Nome = document.getElementById("Nome").value;
  const Email = document.getElementById("Email").value;
  const Senha = document.getElementById("Senha").value;
  /*  
  function handleGoogleSignIn() {
    const provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider)
    .then((result) => {
        console.log(result);
    })
    .cath((error) => {
        console.log(error);
    });

  }
    */
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

  signInWithEmailAndPassword(auth, Email, Senha)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
  });

 onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    const uid = user.uid;
    // ...
  } else {
    // User is signed out
    // ...
  }
});