import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, set, get, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA_UGAa-oEn1nruQpdMtax1LgebMJxjGIM",
  authDomain: "voe-alto-pague-baixo.firebaseapp.com",
  projectId: "voe-alto-pague-baixo",
  storageBucket: "voe-alto-pague-baixo.firebasestorage.app",
  messagingSenderId: "558666320256",
  appId: "1:558666320256:web:801022c471379d2b3d5965",
  databaseURL: "https://voe-alto-pague-baixo-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

async function lerTodosOsFavoritos(userId) {
    try {
        const favoritosRef = ref(database, `users/${userId}/voosFavoritos`);
        const snapshot = await get(favoritosRef);
        return snapshot.exists() ? Object.values(snapshot.val()) : [];
    } catch (error) {
        console.error("Erro ao buscar favoritos:", error);
        return [];
    }
}

function adicionarVooFavorito(userId, vooId, vooData) {
    return set(ref(database, `users/${userId}/voosFavoritos/${vooId}`), vooData);
}

function removerVooFavorito(userId, vooId) {
    return remove(ref(database, `users/${userId}/voosFavoritos/${vooId}`));
}

async function verificarVooFavorito(userId, vooId) {
    const snapshot = await get(ref(database, `users/${userId}/voosFavoritos/${vooId}`));
    return snapshot.exists();
}

export {
    auth,
    onAuthStateChanged,
    lerTodosOsFavoritos,
    adicionarVooFavorito,
    removerVooFavorito,
    verificarVooFavorito
};