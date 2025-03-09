const firebaseConfig = {
  apiKey: "AIzaSyA_UGAa-oEn1nruQpdMtax1LgebMJxjGIM",
  authDomain: "voe-alto-pague-baixo.firebaseapp.com",
  projectId: "voe-alto-pague-baixo",
  storageBucket: "voe-alto-pague-baixo.firebasestorage.app",
  messagingSenderId: "558666320256",
  appId: "1:558666320256:web:801022c471379d2b3d5965"
};
firebase.initializeApp(firebaseConfig);  
const database = firebase.database();

function escreverDataUsuario(userId, name) {
  database.ref('user/' + userId).set({
      username: name
  })
}

function lerDataUsuario(userId) {
  firebase.database().ref('user/' + userId).once('value')
   .then((snapshot) => {
     const username = snapshot.val().username;
     console.log("Nome do usuário:", username);
   });
}


export {database, escreverDataUsuario, lerDataUsuario, firebaseConfig};