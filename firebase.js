const firebaseConfig = {
  apiKey: "AIzaSyA_UGAa-oEn1nruQpdMtax1LgebMJxjGIM",
  authDomain: "voe-alto-pague-baixo.firebaseapp.com",
  projectId: "voe-alto-pague-baixo",
  storageBucket: "voe-alto-pague-baixo.firebasestorage.app",
  messagingSenderId: "558666320256",
  appId: "1:558666320256:web:801022c471379d2b3d5965",
  databaseURL: "https://voe-alto-pague-baixo-default-rtdb.firebaseio.com"
};

const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

function escreverDataUsuario(userId, name) {
  if (!userId) {
    console.error("escreverDataUsuario: userId é nulo ou indefinido.");
    return Promise.reject(new Error("userId é obrigatório para escrever dados do usuário."));
  }
  return database.ref('users/' + userId).set({
    username: name
  })
  .then(() => {
    console.log(`Dados do usuário ${userId} escritos com sucesso.`);
  })
  .catch(error => {
    console.error("Erro ao escrever dados do usuário:", error);
    throw error;
  });
}

async function lerDataUsuario(userId) {
  if (!userId) {
    console.error("lerDataUsuario: userId é nulo ou indefinido. Retornando null.");
    return null;
  }
  try {
    const snapshot = await database.ref('users/' + userId).once('value');
    if (snapshot.exists()) {
      const userData = snapshot.val();
      const username = userData.username;
      console.log("Nome do usuário lido:", username);
      return username;
    } else {
      console.log(`Nenhum dado de usuário encontrado para o ID: ${userId}`);
      return null;
    }
  } catch (error) {
    console.error(`Erro ao ler dados do usuário ${userId}:`, error);
    throw error;
  }
}

function adicionarVooFavorito(userId, flightId, flightData) {
    if (!userId) {
        console.error("adicionarVooFavorito: userId é nulo ou indefinido.");
        return Promise.reject(new Error("userId é obrigatório para adicionar voo favorito."));
    }
    return database.ref('users/' + userId + '/favoritedFlights/' + flightId).set(flightData)
        .then(() => {
            console.log(`Voo ${flightId} adicionado aos favoritos do usuário ${userId}.`);
        })
        .catch(error => {
            console.error("Erro ao adicionar voo favorito:", error);
            throw error;
        });
}

function removerVooFavorito(userId, flightId) {
    if (!userId) {
        console.error("removerVooFavorito: userId é nulo ou indefinido.");
        return Promise.reject(new Error("userId é obrigatório para remover voo favorito."));
    }
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
    if (!userId) {
        console.error("verificarVooFavorito: userId é nulo ou indefinido. Retornando false.");
        return false;
    }
    try {
        const snapshot = await database.ref('users/' + userId + '/favoritedFlights/' + flightId).once('value');
        return snapshot.exists();
    } catch (error) {
        console.error("Erro ao verificar voo favorito:", error);
        throw error;
    }
}

export {
  auth,
  database,
  escreverDataUsuario,
  lerDataUsuario,
  adicionarVooFavorito,
  removerVooFavorito,
  verificarVooFavorito
};