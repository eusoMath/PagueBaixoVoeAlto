

// ==========================================================
// 1. CONFIGURAÇÃO E INTERRUPTOR DE MODO
// ==========================================================
// Altere para 'false' para usar a API real da Skyscanner
const MODO_TESTE = true;


// --- Variáveis Globais ---
let todosOsVoosAtuais = [];
let voosAtualmenteExibidos = 0;
const voosPorPagina = 8; // Quantidade de voos a mostrar por vez com o "Mostrar Mais"

// Chaves de API (Lembre-se da segurança - Mova para Cloud Functions no futuro)
const apiKeySkyscanner = 'c3cef0936cmshc1e136970fdb9a0p1f561fjsn72399617d2cd';
const apiKeyGoogle = 'AIzaSyBepPSla9-WKKzmbp7sXgxB3dajtrbrlRc';
const searchEngineIdGoogle = '61f1a0e3a8cb84fe0';


// ==========================================================
// 2. LÓGICA DE BUSCA (com base no interruptor)
// ==========================================================

async function buscarVoosDaAPI() {
    // Pega os valores dos inputs da página
    let data = document.getElementById("dataDePartida").value;
    let adultos = document.getElementById("adultos").value;
    
    // As variáveis partidaId e chegadaId vêm do autocomplete.js (são globais)
    if (!partidaId || !chegadaId || !data) {
        alert("Por favor, selecione os locais de partida e chegada e a data.");
        return null;
    }

    const url = `https://skyscanner80.p.rapidapi.com/api/v1/flights/search-one-way?fromId=${partidaId}&toId=${chegadaId}&departDate=${data}&adults=${adultos}&market=BR&locale=pt-BR&currency=BRL`;

    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': apiKeySkyscanner,
            'x-rapidapi-host': 'skyscanner80.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`Erro na API: ${response.status}`);
        const result = await response.json();
        // A API retorna um objeto, nós queremos o array de itinerários
        return result.data.itineraries || [];
    } catch (error) {
        console.error("Erro ao buscar voos da API:", error);
        return null; // Retorna nulo em caso de erro
    }
}

async function buscarVoosLocais() {
    try {
        const response = await fetch('./dados-voos.json');
        if (!response.ok) throw new Error(`Erro ao carregar dados locais: ${response.status}`);
        const data = await response.json();
        // O arquivo local já tem a estrutura correta
        return data.data.itineraries || [];
    } catch (error) {
        console.error("Erro ao carregar dados de voos locais:", error);
        return null;
    }
}

// Função principal que decide qual busca fazer
async function iniciarBusca() {
    const resultadosDiv = document.getElementById("resultados");
    resultadosDiv.innerHTML = '<h2>Buscando voos, aguarde...</h2>';

    let voosEncontrados;

    if (MODO_TESTE) {
        console.log("Modo Teste ATIVADO. Buscando dados locais...");
        voosEncontrados = await buscarVoosLocais();
    } else {
        console.log("Modo Teste DESATIVADO. Buscando dados da API Real...");
        voosEncontrados = await buscarVoosDaAPI();
    }

    if (voosEncontrados && voosEncontrados.length > 0) {
        // Ordena os voos por preço
        voosEncontrados.sort((a, b) => a.price.raw - b.price.raw);
        todosOsVoosAtuais = voosEncontrados;
        voosAtualmenteExibidos = 0;
        resultadosDiv.innerHTML = ''; // Limpa a mensagem de "buscando"
        mostrarProximosVoos(); // Exibe a primeira leva de voos
    } else {
        resultadosDiv.innerHTML = '<h2>Nenhum voo encontrado.</h2>';
    }
}


// ==========================================================
// 3. FUNÇÃO 'exibirResultados' DEFINITIVA (com todas as features)
// ==========================================================

function exibirResultados(listaDeVoos) {
    const resultadosDiv = document.getElementById("resultados");

    listaDeVoos.forEach(itinerary => {
        const card = document.createElement('div');
        card.classList.add('card');

        // --- LÓGICA DO BOTÃO DE FAVORITAR ---
        const favoritarButton = document.createElement('button');
        favoritarButton.classList.add('favoritar-btn');
        favoritarButton.innerHTML = '&#9734;'; // Estrela vazia por padrão
        
        // Gera um ID único para o voo para usar no Firebase
        const vooId = btoa(`${itinerary.legs[0].departure}-${itinerary.legs[0].arrival}-${itinerary.price.raw}`);

        favoritarButton.addEventListener('click', async () => {
            const user = auth.currentUser;
            if (!user) {
                alert('Você precisa estar logado para favoritar voos!');
                return;
            }
            
            const isFavorited = favoritarButton.classList.contains('favorited');
            if (isFavorited) {
                await removerVooFavorito(user.uid, vooId);
                favoritarButton.classList.remove('favorited');
                favoritarButton.innerHTML = '&#9734;';
            } else {
                await adicionarVooFavorito(user.uid, vooId, itinerary);
                favoritarButton.classList.add('favorited');
                favoritarButton.innerHTML = '&#9733;'; // Estrela cheia
            }
        });
        
        // --- INFORMAÇÕES DO VOO ---
        const price = document.createElement('h3');
        price.textContent = `Preço: ${itinerary.price.formatted}`;

        const departure = document.createElement('p');
        const arrival = document.createElement('p');
        const duration = document.createElement('p');
        const marketingCarrier = document.createElement('p');
        
        // Formatação de Datas e Duração
        const leg = itinerary.legs[0];
        const departureDate = new Date(leg.departure);
        const arrivalDate = new Date(leg.arrival);
        const durationMinutes = leg.durationInMinutes;
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;

        departure.textContent = `Partida: ${departureDate.toLocaleDateString('pt-BR')} ${departureDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        arrival.textContent = `Chegada: ${arrivalDate.toLocaleDateString('pt-BR')} ${arrivalDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        duration.textContent = `Duração: ${hours}h ${minutes}m`;
        marketingCarrier.textContent = `Companhia: ${leg.carriers.marketing[0].name}`;

        // --- LÓGICA DO BOTÃO DE COMPRAR ---
        const comprarButton = document.createElement('button');
        comprarButton.textContent = 'Comprar';
        comprarButton.addEventListener('click', () => {
            // Preenche a caixa de compra com os dados do voo clicado
            document.getElementById('preco').textContent = `Preço: ${itinerary.price.formatted}`;
            document.getElementById('partida').textContent = departure.textContent;
            document.getElementById('chegada').textContent = arrival.textContent;
            document.getElementById('duracao').textContent = duration.textContent;
            document.getElementById('companhia').textContent = marketingCarrier.textContent;
            
            // Exibe a caixa
            document.getElementById('caixaDeCompra').style.display = 'block';
        });

        // Adiciona tudo ao card
        card.appendChild(favoritarButton);
        card.appendChild(price);
        card.appendChild(departure);
        card.appendChild(arrival);
        card.appendChild(duration);
        card.appendChild(marketingCarrier);
        card.appendChild(comprarButton);

        // Adiciona o card à div de resultados
        resultadosDiv.appendChild(card);

        // Verifica o status de favorito assim que o card é criado
        const user = auth.currentUser;
        if (user) {
            verificarVooFavorito(user.uid, vooId).then(isFavorito => {
                if (isFavorito) {
                    favoritarButton.classList.add('favorited');
                    favoritarButton.innerHTML = '&#9733;';
                }
            });
        }
    });
}


// ==========================================================
// 4. LÓGICA DO "MOSTRAR MAIS" E EVENT LISTENERS
// ==========================================================

function mostrarProximosVoos() {
    const proximosVoos = todosOsVoosAtuais.slice(voosAtualmenteExibidos, voosAtualmenteExibidos + voosPorPagina);
    exibirResultados(proximosVoos);
    voosAtualmenteExibidos += voosPorPagina;

    // Controla a visibilidade do botão "Mostrar Mais"
    const mostrarMaisButton = document.getElementById("mostrarMaisButton");
    if (voosAtualmenteExibidos >= todosOsVoosAtuais.length) {
        mostrarMaisButton.style.display = "none"; // Esconde o botão se não houver mais voos
    } else {
        mostrarMaisButton.style.display = "block"; // Mostra o botão
    }
}

// Event listener principal que roda quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    // Configura o botão "Buscar"
    const buscarButton = document.getElementById("Buscar");
    if (buscarButton) {
        buscarButton.addEventListener("click", iniciarBusca);
    }
    
    // Configura o botão "Mostrar Mais"
    const mostrarMaisButton = document.getElementById("mostrarMaisButton");
    if (mostrarMaisButton) {
        mostrarMaisButton.style.display = "none"; // Começa escondido
        mostrarMaisButton.addEventListener("click", mostrarProximosVoos);
    }

    // Lógica do botão de logout (pode ser mantida aqui ou em um arquivo separado)
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            auth.signOut().then(() => {
                window.location.href = 'index.html';
            }).catch(error => console.error('Erro ao fazer logout:', error));
        });
    }

    // Fecha a caixa de compra
    const fecharCaixaButton = document.getElementById('fecharCaixaDeCompra');
    if(fecharCaixaButton) {
        fecharCaixaButton.addEventListener('click', () => {
            document.getElementById('caixaDeCompra').style.display = 'none';
        });
    }

    // Inicia com os dados de teste se o modo estiver ativo
    if (MODO_TESTE) {
        iniciarBusca();
    }
});