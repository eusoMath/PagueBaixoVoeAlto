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

function adicionarVooFavorito(userId, flightId, flightData) {
    return database.ref('users/' + userId + '/favoritedFlights/' + flightId).set(flightData)
        .then(() => {
            console.log(`Voo ${flightId} adicionado aos favoritos do usuário ${userId}.`);
        })
        .catch(error => {
            console.error("Erro ao adicionar voo favorito:", error);
            throw error; // Propagar o erro para quem chamou
        });
}

function removerVooFavorito(userId, flightId) {
    return database.ref('users/' + userId + '/favoritedFlights/' + flightId).remove()
        .then(() => {
            console.log(`Voo ${flightId} removido dos favoritos do usuário ${userId}.`);
        })
        .catch(error => {
            console.error("Erro ao remover voo favorito:", error);
            throw error;
        });
}

async function verificarVooFavorito(userId, flightId) {
    try {
        const snapshot = await database.ref('users/' + userId + '/favoritedFlights/' + flightId).once('value');
        return snapshot.exists(); // Retorna true se o voo existe nos favoritos, false caso contrário
    } catch (error) {
        console.error("Erro ao verificar voo favorito:", error);
        return false;
    }
}

// Exportar as novas funções
export { database, escreverDataUsuario, lerDataUsuario, adicionarVooFavorito, removerVooFavorito, verificarVooFavorito, firebaseConfig };