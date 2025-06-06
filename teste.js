let voosExibidosInicial = 8;
let todosVoos = [];
let voosAtualmenteExibidos = [];
const caixaDeCompra = document.getElementById('caixaDeCompra');
const tituloCaixaDeCompra = caixaDeCompra.querySelector('h1');
const botaoProsseguirCompra = caixaDeCompra.querySelector('button');
const imagemFechar = document.getElementById('fecharCaixaDeCompra');
let recaptchaResolvido = false;

const precoElement = document.getElementById('preco');
const partidaElement = document.getElementById('partida');
const chegadaElement = document.getElementById('chegada');
const duracaoElement = document.getElementById('duracao');
const companhiaElement = document.getElementById('companhia');

const apiKey = 'AIzaSyBepPSla9-WKKzmbp7sXgxB3dajtrbrlRc';
const searchEngineId = '61f1a0e3a8cb84fe0';

function generateFlightId(voo) {
    const idString = `${voo.legs[0].departure}-${voo.legs[0].arrival}-${voo.legs[0].carriers.marketing[0].name}-${voo.price.raw}`;
    return btoa(idString).replace(/=/g, '');
}

async function carregarVoosLocais() {
    try {
        const response = await fetch('./dados-voos.json');
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
            voosAtualmenteExibidos = []; 
            const resultadosDiv = document.getElementById('resultados');
            if(resultadosDiv) resultadosDiv.innerHTML = '';
            
            exibirProximosVoos(voosExibidosInicial);
        } else {
            console.warn("Nenhum dado de voo encontrado ou estrutura inválida.");
        }
    } catch (error) {
        console.error("Erro ao carregar e exibir dados:", error);
    }
}

function exibirResultados(voos, containerId) {
    let resultadosDiv = document.getElementById(containerId);
    
    if (!resultadosDiv) {
        console.error(`Container com ID '${containerId}' não foi encontrado no HTML.`);
        return;
    }

    voos.forEach(itinerary => {
        const card = document.createElement('div');
        card.classList.add('card');

        const favoritarButton = document.createElement('button');
        favoritarButton.classList.add('favoritar-btn');
        favoritarButton.innerHTML = '&#9733;';
        favoritarButton.dataset.voo = JSON.stringify(itinerary);

        favoritarButton.addEventListener('click', async (event) => {
            const clickedButton = event.currentTarget;
            const user = auth.currentUser;
            if (!user) {
                alert('Você precisa estar logado para favoritar voos!');
                return;
            }
            const userId = user.uid;

            const vooParaFavoritar = JSON.parse(clickedButton.dataset.voo);
            const vooId = generateFlightId(vooParaFavoritar);

            const isFavorited = clickedButton.classList.contains('favorited');

            try {
                if (isFavorited) {
                    await removerVooFavorito(userId, vooId);
                    clickedButton.classList.remove('favorited');
                    clickedButton.innerHTML = '&#9733;';
                } else {
                    await adicionarVooFavorito(userId, vooId, vooParaFavoritar);
                    clickedButton.classList.add('favorited');
                    clickedButton.innerHTML = '&#9733;';
                }
            } catch (error) {
                console.error("Erro ao favoritar/desfavoritar voo:", error);
                alert("Ocorreu um erro ao atualizar seus favoritos. Por favor, tente novamente.");
            }
        });

        const price = document.createElement('h3');
        price.textContent = `Preço: ${itinerary.price.formatted}`;

        const departureDate = new Date(itinerary.legs[0].departure);
        const arrivalDate = new Date(itinerary.legs[0].arrival);

        const formattedDepartureDate = departureDate.toLocaleDateString('pt-BR');
        const formattedDepartureTime = departureDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const formattedArrivalDate = arrivalDate.toLocaleDateString('pt-BR');
        const formattedArrivalTime = arrivalDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

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
            precoElement.textContent = `Preço: ${itinerary.price.formatted}`;
            partidaElement.textContent = `Partida: ${formattedDepartureDate} às ${formattedDepartureTime}`;
            chegadaElement.textContent = `Chegada: ${formattedArrivalDate} às ${formattedArrivalTime}`;
            duracaoElement.textContent = `Duração: ${formattedDuration}`;
            companhiaElement.textContent = `Companhia Aérea: ${itinerary.legs[0].carriers.marketing[0].name}`;

            caixaDeCompra.style.display = 'inline';
            caixaDeCompra.style.opacity = '1';

            window.scrollTo({ top: 0, behavior: 'smooth' });

            botaoProsseguirCompra.textContent = 'Prosseguir';
            botaoProsseguirCompra.removeEventListener('click', finalizarCompra);
            botaoProsseguirCompra.addEventListener('click', prosseguirParaCompra);
            recaptchaResolvido = true;
        });

        card.appendChild(favoritarButton);
        card.appendChild(price);
        card.appendChild(departure);
        card.appendChild(arrival);
        card.appendChild(duration);
        card.appendChild(marketingCarrier);
        card.appendChild(comprarButton);

        resultadosDiv.appendChild(card);

        auth.onAuthStateChanged(async (user) => {
            if (user) {
                const vooId = generateFlightId(itinerary);
                try {
                    const favorito = await verificarVooFavorito(user.uid, vooId);
                    if (favorito) {
                        favoritarButton.classList.add('favorited');
                    } else {
                        favoritarButton.classList.remove('favorited');
                    }
                } catch (error) {
                    console.error("Erro ao verificar status de favorito do voo:", error);
                }
            } else {
                favoritarButton.classList.remove('favorited');
            }
        });
    });
}

function exibirProximosVoos(quantidade = 4) {
    const proximoLimite = voosAtualmenteExibidos.length + quantidade;
    const novosVoos = todosVoos.slice(voosAtualmenteExibidos.length, proximoLimite);
    exibirResultados(novosVoos, 'resultados');
    voosAtualmenteExibidos = todosVoos.slice(0, proximoLimite);
    exibirBotaoMostrarMais();
}

function exibirBotaoMostrarMais() {
    const mostrarMaisButton = document.getElementById('mostrarMaisButton');
    if (mostrarMaisButton) {
        if (todosVoos.length > voosAtualmenteExibidos.length) {
            mostrarMaisButton.style.display = 'block';
            mostrarMaisButton.onclick = () => {
                exibirProximosVoos();
                const sect1 = document.getElementById("sect1");
                if(sect1) sect1.style.height = "fit-content";
            };
        } else {
            mostrarMaisButton.style.display = 'none';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged(async (user) => {
        const nomeUsuarioElement = document.getElementById('nomeUsuario');
        if (nomeUsuarioElement) {
            if (user) {
                const nomeExibicao = user.displayName;
                if (nomeExibicao) {
                    nomeUsuarioElement.textContent = `Bem-vindo(a), ${nomeExibicao}!`;
                } else {
                    try {
                        const username = await lerDataUsuario(user.uid);
                        nomeUsuarioElement.textContent = `Bem-vindo(a), ${username || user.email}!`;
                    } catch (error) {
                        console.error("Erro ao ler nome do usuário do banco de dados:", error);
                        nomeUsuarioElement.textContent = `Bem-vindo(a), ${user.email}!`;
                    }
                }
            } else {
                window.location.href = "index.html";
            }
        }
    });

    const buscarButton = document.getElementById('Buscar');
    if (buscarButton) {
        buscarButton.addEventListener('click', () => {
            voosExibidosInicial = 8;
            carregarDados();
        });
    }
    carregarDados();
});

document.getElementById('fecharCaixaDeCompra').addEventListener('click', () => {
    caixaDeCompra.style.display = 'none';
    caixaDeCompra.style.opacity = '0';
    recaptchaResolvido = false;
});

const prosseguirBtn = document.getElementById('prosseguir');
if (prosseguirBtn) {
    prosseguirBtn.addEventListener('click', prosseguirParaCompra);
}

function prosseguirParaCompra() {
    if (recaptchaResolvido) {
        botaoProsseguirCompra.textContent = 'Finalizar Compra';
        botaoProsseguirCompra.removeEventListener('click', prosseguirParaCompra);
        botaoProsseguirCompra.addEventListener('click', finalizarCompra);
    } else {
        alert('Por favor, complete a verificação ReCAPTCHA.');
    }
}

window.onRecaptchaSuccess = function(token) {
    console.log('ReCAPTCHA resolvido:', token);
    recaptchaResolvido = true;
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
            caixaDeCompra.style.display = 'none';
            caixaDeCompra.style.opacity = '0';
        })
        .catch(error => {
            console.error("Erro ao finalizar compra e buscar link:", error);
            alert("Ocorreu um erro ao tentar finalizar a compra. Por favor, tente novamente.");
            caixaDeCompra.style.display = 'none';
            caixaDeCompra.style.opacity = '0';
        });
}

function buscarLinkCompanhiaAerea(nomeCompanhia) {
    if (!apiKey || !searchEngineId) {
        console.error("Chave de API ou ID do mecanismo de pesquisa do Google não configurados.");
        return Promise.resolve(null);
    }
    const query = `${nomeCompanhia} site oficial`;
    const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}`;
    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error(`Erro na API de busca: ${response.statusText}`);
            return response.json();
        })
        .then(data => {
            if (data.items && data.items.length > 0) {
                const officialLink = data.items.find(item => {
                    const url = item.link.toLowerCase();
                    const commonName = nomeCompanhia.toLowerCase().replace(/ linhas aéreas| airlines brasil| /g, '');
                    return url.includes(commonName) && !url.includes('wikipedia') && !url.includes('melhoresdestinos') && !url.includes('reclameaqui');
                });
                return officialLink ? officialLink.link : data.items[0].link;
            }
            return null;
        })
        .catch(error => {
            console.error("Erro ao buscar o site da companhia aérea:", error);
            return null;
        });
}

document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logout-button');

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            console.log("Botão de logout clicado. Tentando deslogar...");
            auth.signOut().then(() => {
                console.log('Usuário deslogado com sucesso.');
                window.location.href = 'index.html';
            }).catch((error) => {
                console.error('Erro ao fazer logout:', error);
                alert('Ocorreu um erro ao tentar sair. Por favor, tente novamente.');
            });
        });
    }
});
