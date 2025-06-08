import { auth, onAuthStateChanged, lerTodosOsFavoritos } from './firebase.js';
import { exibirResultados } from './card-renderer.js';
import { setupModalListeners } from './purchase-modal.js';

document.addEventListener('DOMContentLoaded', () => {
    setupModalListeners();
    
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => { auth.signOut().then(() => { window.location.href = 'index.html'; }); });
    }

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const voosFavoritados = await lerTodosOsFavoritos(user.uid);
            const mensagem = document.getElementById('mensagem-sem-favoritos');
            
            const favoritosIds = voosFavoritados.map(voo => btoa(`${voo.legs[0].departure}-${voo.legs[0].arrival}-${voo.price.raw}`));
            const favoritosSet = new Set(favoritosIds);

            if (voosFavoritados.length > 0) {
                if (mensagem) mensagem.style.display = 'none';
                exibirResultados(voosFavoritados, 'resultados-favoritos', favoritosSet);
            } else {
                if (mensagem) mensagem.style.display = 'block';
            }
        } else {
            window.location.href = 'index.html';
        }
    });
});