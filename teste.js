import { escreverDataUsuario, lerDataUsuario, adicionarVooFavorito, removerVooFavorito, verificarVooFavorito } from './firebase.js';

let voosExibidosInicial = 8; // Quantidade inicial de voos a exibir
let todosVoos = []; // Array para armazenar todos os voos carregados
let voosAtualmenteExibidos = []; // Array para rastrear os voos que já estão na tela
const caixaDeCompra = document.getElementById('caixaDeCompra');
const tituloCaixaDeCompra = caixaDeCompra.querySelector('h1'); // Seleciona o título da caixa
const botaoProsseguirCompra = caixaDeCompra.querySelector('button'); // Seleciona o botão de prosseguir
const imagemFechar = document.getElementById('fecharCaixaDeCompra'); // Seleciona a imagem de fechar
const qrCodeImage = document.getElementById('qrCode'); // Seleciona a imagem do QR code
let recaptchaResolvido = false;

// Seleciona os novos elementos para exibir as informações
const precoElement = document.getElementById('preco');
const partidaElement = document.getElementById('partida');
const chegadaElement = document.getElementById('chegada');
const duracaoElement = document.getElementById('duracao');
const companhiaElement = document.getElementById('companhia');

// Substitua com sua chave de API e ID do mecanismo de pesquisa do Google
// ATENÇÃO: Em produção, estas chaves devem ser gerenciadas com mais segurança (ex: backend)
const apiKey = 'AIzaSyBepPSla9-WKKzmbp7sXgxB3dajtrbrlRc';
const searchEngineId = '61f1a0e3a8cb84fe0';


// Função para gerar um ID único para o voo
function generateFlightId(voo) {
    // Combine propriedades que tornem o voo razoavelmente único
    const idString = `${voo.legs[0].departure}-${voo.legs[0].arrival}-${voo.legs[0].carriers.marketing[0].name}-${voo.price.raw}`;
    // Crie um hash simples usando btoa para codificar
    return btoa(idString).replace(/=/g, ''); // Remove '=' para um ID mais limpo
}

async function carregarVoosLocais() {
    try {
        const response = await fetch('./dados-voos.json'); // Caminho para o seu arquivo JSON
        if (!response.ok) {
            throw new Error(`Erro ao carregar dados locais: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erro ao carregar dados de voos locais:", error);
        return null;
    }
}

async function carregarDados() {
    try {
        const dados = await carregarVoosLocais();
        if (dados && dados.data && dados.data.itineraries) {
            todosVoos = dados.data.itineraries;
            // Limpa os resultados anteriores antes de exibir novos
            document.getElementById('resultados').innerHTML = '';
            // Exibe a quantidade inicial de voos
            exibirProximosVoos(voosExibidosInicial);
        } else {
            console.warn("Nenhum dado de voo encontrado ou estrutura inválida.");
        }
    } catch (error) {
        console.error("Erro ao carregar e exibir dados:", error);
    }
}

function exibirResultados(voos) {
    let resultadosDiv = document.getElementById('resultados');
    if (!resultadosDiv) {
        resultadosDiv = document.createElement('div');
        resultadosDiv.id = 'resultados';
        document.querySelector('section').appendChild(resultadosDiv);
    }

    voos.forEach(itinerary => {
        const card = document.createElement('div');
        card.classList.add('card');

        // Botão/Ícone de Favoritar
        const favoritarButton = document.createElement('button');
        favoritarButton.classList.add('favoritar-btn');
        favoritarButton.innerHTML = '&#9733;'; // Ícone de estrela vazia (pode ser SVG ou outro ícone)
        favoritarButton.dataset.voo = JSON.stringify(itinerary); // Armazena os dados do voo no botão

        favoritarButton.addEventListener('click', async (event) => {
            const clickedButton = event.currentTarget; // O botão que foi clicado

            const user = firebase.auth().currentUser;
            if (!user) {
                alert('Você precisa estar logado para favoritar voos!');
                return;
            }
            const userId = user.uid;

            const vooParaFavoritar = JSON.parse(clickedButton.dataset.voo);
            const vooId = generateFlightId(vooParaFavoritar);

            const isFavorited = clickedButton.classList.contains('favorited');

            if (isFavorited) {
                // Remover dos favoritos
                await removerVooFavorito(userId, vooId);
                clickedButton.classList.remove('favorited');
                clickedButton.innerHTML = '&#9733;'; // Coração vazio
                alert('Voo removido dos favoritos!');
            } else {
                // Adicionar aos favoritos
                await adicionarVooFavorito(userId, vooId, vooParaFavoritar);
                clickedButton.classList.add('favorited');
                clickedButton.innerHTML = '&#9733;'; // Coração cheio
                alert('Voo adicionado aos favoritos!');
            }
        });

        const price = document.createElement('h3');
        price.textContent = `Preço: ${itinerary.price.formatted}`;

        const departureDate = new Date(itinerary.legs[0].departure);
        const arrivalDate = new Date(itinerary.legs[0].arrival);

        const formattedDepartureDate = departureDate.toLocaleDateString('pt-BR');
        const formattedDepartureTime = departureDate.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
        });
        const formattedArrivalDate = arrivalDate.toLocaleDateString('pt-BR');
        const formattedArrivalTime = arrivalDate.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
        });

        const departure = document.createElement('p');
        departure.textContent = `Partida: ${formattedDepartureDate} - ${formattedDepartureTime}`;

        const arrival = document.createElement('p');
        arrival.textContent = `Chegada: ${formattedArrivalDate} - ${formattedArrivalTime}`;

        const durationMinutes = itinerary.legs[0].durationInMinutes;
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        const formattedDuration = `${hours}h ${minutes}m`;

        const duration = document.createElement('p');
        duration.textContent = `Duração: ${formattedDuration}`;

        const marketingCarrier = document.createElement('p');
        marketingCarrier.textContent = `Companhia Aérea: ${itinerary.legs[0].carriers.marketing[0].name}`;

        const comprarButton = document.createElement('button');
        comprarButton.textContent = 'Comprar';
        comprarButton.addEventListener('click', () => {
            // Atualiza o texto dos elementos existentes com as informações do voo
            precoElement.textContent = `Preço: ${itinerary.price.formatted}`;
            partidaElement.textContent = `Partida: ${formattedDepartureDate} às ${formattedDepartureTime}`;
            chegadaElement.textContent = `Chegada: ${formattedArrivalDate} às ${formattedArrivalTime}`;
            duracaoElement.textContent = `Duração: ${formattedDuration}`;
            companhiaElement.textContent = `Companhia Aérea: ${itinerary.legs[0].carriers.marketing[0].name}`;

            // Exibe a caixa de compra com a transição
            caixaDeCompra.style.display = 'inline';
            caixaDeCompra.style.opacity = '1';

            window.scrollTo({
                top: 0,
                behavior: 'smooth' // Opcional: para uma rolagem suave
            });

            // Garante que o botão de prosseguir esteja no estado correto (antes do reCAPTCHA)
            botaoProsseguirCompra.textContent = 'Prosseguir';
            // Remove e adiciona listeners para evitar múltiplos eventos
            botaoProsseguirCompra.removeEventListener('click', finalizarCompra);
            botaoProsseguirCompra.addEventListener('click', prosseguirParaCompra);
            recaptchaResolvido = false; // Reseta o estado do reCAPTCHA
        });

        card.appendChild(favoritarButton); // Adicione o botão de favoritar
        card.appendChild(price);
        card.appendChild(departure);
        card.appendChild(arrival);
        card.appendChild(duration);
        card.appendChild(marketingCarrier);
        card.appendChild(comprarButton);

        resultadosDiv.appendChild(card);

        // Verifica o estado de favorito do voo após o usuário estar logado
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                const vooId = generateFlightId(itinerary);
                const favorito = await verificarVooFavorito(user.uid, vooId);
                if (favorito) {
                    favoritarButton.classList.add('favorited');
                    favoritarButton.innerHTML = '&#9733;'; // Ícone de estrela preenchida
                }
            }
        });
    });
}

function exibirProximosVoos(quantidade = 4) {
    const proximoLimite = voosAtualmenteExibidos.length + quantidade;
    const novosVoos = todosVoos.slice(voosAtualmenteExibidos.length, proximoLimite);
    exibirResultados(novosVoos);
    voosAtualmenteExibidos = todosVoos.slice(0, proximoLimite);
    exibirBotaoMostrarMais();
}

function exibirBotaoMostrarMais() {
    const mostrarMaisButton = document.getElementById('mostrarMaisButton');
    if (todosVoos.length > voosAtualmenteExibidos.length) {
        mostrarMaisButton.style.display = 'block';
        mostrarMaisButton.onclick = () => {
            exibirProximosVoos();
            document.getElementById("sect1").style.height = "fit-content";
        };
        // Garante que o botão seja adicionado ao DOM se ainda não estiver
        if (!document.getElementById("sect1").contains(mostrarMaisButton)) {
            document.getElementById("sect1").appendChild(mostrarMaisButton);
        }
    } else {
        mostrarMaisButton.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Listener para exibir o nome do usuário logado
    firebase.auth().onAuthStateChanged((user) => {
        const nomeUsuarioElement = document.getElementById('nomeUsuario');
        if (nomeUsuarioElement) {
            if (user) {
                const nomeExibicao = user.displayName;
                if (nomeExibicao) {
                    nomeUsuarioElement.textContent = `Bem-vindo(a), ${nomeExibicao}!`;
                } else {
                    // Tenta ler do Realtime Database se displayName não estiver disponível
                    lerDataUsuario(user.uid)
                        .then(username => {
                            if (username) {
                                nomeUsuarioElement.textContent = `Bem-vindo(a), ${username}!`;
                            } else {
                                nomeUsuarioElement.textContent = `Bem-vindo(a), ${user.email}!`;
                            }
                        })
                        .catch(error => {
                            console.error("Erro ao ler nome do usuário do banco de dados:", error);
                            nomeUsuarioElement.textContent = `Bem-vindo(a), ${user.email}!`;
                        });
                }
            } else {
                // Se não houver usuário logado, redireciona para a página de login
                window.location.href = "index.html";
            }
        }
    });

    document.getElementById('Buscar').addEventListener('click', () => {
        voosExibidosInicial = 8; // Reseta a quantidade inicial ao clicar em "Buscar"
        voosAtualmenteExibidos = []; // Limpa os voos exibidos
        document.getElementById('resultados').innerHTML = ''; // Limpa a tela antes de nova busca
        carregarDados();
    });

    // Garante que o botão "Mostrar Mais" exista no HTML com o ID correto
    const mostrarMaisButton = document.createElement('button');
    mostrarMaisButton.id = 'mostrarMaisButton';
    mostrarMaisButton.textContent = 'Mostrar Mais';
    mostrarMaisButton.style.display = 'none'; // Inicialmente escondido
    const sect1 = document.getElementById('sect1');
    if (sect1) {
        sect1.appendChild(mostrarMaisButton);
    } else {
        console.error("Elemento com ID 'sect1' não encontrado no HTML.");
    }

    carregarDados(); // Carrega os dados iniciais ao carregar a página
});

document.getElementById('fecharCaixaDeCompra').addEventListener('click', () => {
    caixaDeCompra.style.display = 'none';
    caixaDeCompra.style.opacity = '0';
    qrCodeImage.style.opacity = '0';
    botaoProsseguirCompra.textContent = 'Prosseguir'; // Reseta o texto do botão
    // Remove o listener de finalizarCompra e adiciona o de prosseguirParaCompra
    botaoProsseguirCompra.removeEventListener('click', finalizarCompra);
    botaoProsseguirCompra.addEventListener('click', prosseguirParaCompra);
    recaptchaResolvido = false; // Reseta o estado do reCAPTCHA
});

// A função prosseguirParaCompra é agora o listener inicial para o botão "prosseguir"
document.getElementById('prosseguir').addEventListener('click', prosseguirParaCompra);

function prosseguirParaCompra() {
    if (recaptchaResolvido) {
        // Se o ReCAPTCHA já foi resolvido, podemos prosseguir para a lógica de "Finalizar Compra"
        qrCodeImage.style.opacity = '1'; // Exibe o QR Code
        botaoProsseguirCompra.textContent = 'Finalizar Compra';
        botaoProsseguirCompra.removeEventListener('click', prosseguirParaCompra);
        botaoProsseguirCompra.addEventListener('click', finalizarCompra);
    } else {
        alert('Por favor, complete a verificação ReCAPTCHA.');
        // Opcional: Você pode adicionar alguma indicação visual para o usuário completar o ReCAPTCHA
    }
}

// Global function para o reCAPTCHA callback (precisa ser global)
window.onRecaptchaSuccess = function(token) {
    console.log('ReCAPTCHA resolvido:', token);
    recaptchaResolvido = true;
    // O texto do botão já é "Prosseguir" antes do reCAPTCHA, e a função prosseguirParaCompra
    // já lida com a mudança para "Finalizar Compra" se o reCAPTCHA for resolvido.
    // Não é necessário mudar o texto aqui, a menos que queira um feedback imediato diferente.
};


function finalizarCompra() {
    const companhia = companhiaElement.textContent.split(': ')[1];
    buscarLinkCompanhiaAerea(companhia)
        .then(linkCompra => {
            if (linkCompra) {
                window.open(linkCompra, '_blank');
            } else {
                alert(`Não foi possível encontrar o site da ${companhia}.`);
            }
            // Resetar o estado da caixa de compra após finalizar
            caixaDeCompra.style.display = 'none';
            caixaDeCompra.style.opacity = '0';
            qrCodeImage.style.opacity = '0';
            botaoProsseguirCompra.textContent = 'Prosseguir'; // Reseta o texto do botão
            botaoProsseguirCompra.removeEventListener('click', finalizarCompra);
            botaoProsseguirCompra.addEventListener('click', prosseguirParaCompra);
            recaptchaResolvido = false; // Reseta o estado do reCAPTCHA
        });
}

function buscarLinkCompanhiaAerea(nomeCompanhia) {
    if (!apiKey || !searchEngineId) {
        console.error("Chave de API ou ID do mecanismo de pesquisa do Google não configurados.");
        return Promise.resolve(null);
    }

    const query = `${nomeCompanhia} site oficial`; // Adicionado "site oficial" para resultados mais precisos
    const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}`;

    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro na requisição da API de busca: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.items && data.items.length > 0) {
                // Tenta encontrar um link que pareça mais oficial
                const officialLink = data.items.find(item => {
                    const url = item.link.toLowerCase();
                    return url.includes(nomeCompanhia.toLowerCase().replace(/ linhas aéreas| airlines brasil/g, '').replace(/\s/g, '')) &&
                           !url.includes('wikipedia') && !url.includes('melhoresdestinos'); // Filtros básicos
                });
                return officialLink ? officialLink.link : data.items[0].link; // Retorna o mais oficial ou o primeiro
            } else {
                console.log(`Nenhum site oficial encontrado para ${nomeCompanhia}.`);
                return null;
            }
        })
        .catch(error => {
            console.error("Erro ao buscar o site da companhia aérea:", error);
            return null;
        });
}