document.addEventListener('DOMContentLoaded', () => {
    
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const voosFavoritados = await lerTodosOsFavoritos(user.uid);

            if (voosFavoritados && voosFavoritados.length > 0) {
                exibirResultados(voosFavoritados, 'resultados-favoritos');
            } else {
                const mensagem = document.getElementById('mensagem-sem-favoritos');
                if (mensagem) {
                    mensagem.style.display = 'block';
                }
            }

        } else {
            console.log("Usuário não logado. Redirecionando para a página de login.");
            window.location.href = 'index.html';
        }
    });

});