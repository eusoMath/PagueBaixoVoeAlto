// Importa as funções que precisamos do nosso firebase.js e do SDK do Firebase
import { auth } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { set, ref, getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Função para escrever dados do usuário
function escreverDataUsuario(userId, nome, email) {
    const database = getDatabase();
    return set(ref(database, 'users/' + userId), {
        username: nome,
        email: email
    });
}

// Espera o HTML carregar para executar o código
document.addEventListener('DOMContentLoaded', () => {

    // Seleciona os elementos que vamos usar do seu HTML
    const formLogin = document.getElementById('FormLogin');
    const formRegister = document.getElementById('FormRegister');
    const btnMudar = document.getElementById('mudar'); // O seu botão de troca
    
    // Elementos do painel lateral que também vamos alterar
    const mensagemRegistroH1 = document.getElementById('mensagemRegistro');
    const mensagem2RegistroP = document.getElementById('mensagem2Registro');

    // Botões de submissão dos formulários
    const btnEntrarLogin = document.getElementById('EntrarLogin');
    const btnEntrarRegister = document.getElementById('EntrarRegister');

    // Elementos para exibir mensagens de erro
    const mensagemErroLogin = document.getElementById('mensagemDeErroLogin');
    const mensagemErroRegistro = document.getElementById('mensagemDeErroRegistro');
    
    // --- LÓGICA PARA ALTERNAR ENTRE FORMULÁRIOS (ADAPTADA AO SEU HTML) ---
    if (btnMudar) {
        btnMudar.addEventListener('click', () => {
            // Verifica se o formulário de login está visível
            const isLoginVisible = window.getComputedStyle(formLogin).display !== 'none';

            if (isLoginVisible) {
                // Esconde o login e mostra o registro
                formLogin.style.display = 'none';
                formRegister.style.display = 'block';

                // Altera os textos do painel lateral
                mensagemRegistroH1.textContent = 'Já possui uma conta?';
                mensagem2RegistroP.textContent = 'Faça login para acessar os melhores preços e salvar seus voos favoritos!';
                btnMudar.textContent = 'Fazer Login';

            } else {
                // Esconde o registro e mostra o login
                formRegister.style.display = 'none';
                formLogin.style.display = 'block';

                // Volta os textos do painel lateral para o original
                mensagemRegistroH1.textContent = 'Não possui registro?';
                mensagem2RegistroP.textContent = 'Registre-se no nosso site e tenha acesso aos voos mais baratos do mercado!';
                btnMudar.textContent = 'Registrar';
            }
        });
    }

    // --- Lógica do Botão de Login ---
    if(btnEntrarLogin) {
        btnEntrarLogin.addEventListener('click', (event) => {
            event.preventDefault(); // Impede o formulário de recarregar a página
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;
            mensagemErroLogin.textContent = '';

            if (!email || !senha) {
                mensagemErroLogin.textContent = 'Por favor, preencha todos os campos.';
                return;
            }

            signInWithEmailAndPassword(auth, email, senha)
                .then((userCredential) => {
                    window.location.href = './home.html';
                })
                .catch((error) => {
                    mensagemErroLogin.textContent = 'Email ou senha inválidos.';
                });
        });
    }

    // --- Lógica do Botão de Registro ---
    if(btnEntrarRegister) {
        btnEntrarRegister.addEventListener('click', (event) => {
            event.preventDefault(); // Impede o formulário de recarregar a página
            const nome = document.getElementById('Nome').value;
            const email = document.getElementById('Email').value;
            const senha = document.getElementById('Senha').value;
            mensagemErroRegistro.textContent = '';

            if (!nome || !email || !senha) {
                mensagemErroRegistro.textContent = 'Por favor, preencha todos os campos.';
                return;
            }

            createUserWithEmailAndPassword(auth, email, senha)
                .then((userCredential) => {
                    const user = userCredential.user;
                    return escreverDataUsuario(user.uid, nome, email).then(() => {
                        window.location.href = './home.html';
                    });
                })
                .catch((error) => {
                    if (error.code === 'auth/email-already-in-use') {
                        mensagemErroRegistro.textContent = 'Este email já está em uso.';
                    } else if (error.code === 'auth/weak-password') {
                        mensagemErroRegistro.textContent = 'A senha deve ter pelo menos 6 caracteres.';
                    } else {
                        mensagemErroRegistro.textContent = 'Ocorreu um erro ao registrar.';
                    }
                });
        });
    }
});