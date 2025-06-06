import { firebaseConfig } from './firebase.js';

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    lerDataUsuario(user.uid);
  } else {
    window.location.href = "index.html";
  }
});

function lerDataUsuario(userId) {
  database.ref('user/' + userId).once('value')
    .then((snapshot) => {
      if (snapshot.exists()) {
        const username = snapshot.val().username;
        document.getElementById("nomeUsuario").textContent = "Bem-vindo, " + username + "!";
      } else {
        console.log("Usuário não encontrado no banco de dados.");
      }
    });
}