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
const apiKey = 'AIzaSyBepPSla9-WKKzmbp7sXgxB3dajtrbrlRc';
const searchEngineId = '61f1a0e3a8cb84fe0';

async function carregarDados() {
    try {
        const response = await fetch('dados-voos.json');
        if (!response.ok) {
            throw new Error(`Erro ao carregar dados: ${response.status}`);
        }
        document.getElementById("sect1").style.height = "fit-content"; // Ajusta a altura inicial
        const dados = await response.json();
        todosVoos = dados.data.itineraries.sort((a, b) => a.price.raw - b.price.raw); // Ordena por preço
        exibirProximosVoos(voosExibidosInicial); // Exibe a quantidade inicial
        exibirBotaoMostrarMais();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
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

            // Rola para o topo da caixa de compra
            //caixaDeCompra.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        card.appendChild(price);
        card.appendChild(departure);
        card.appendChild(arrival);
        card.appendChild(duration);
        card.appendChild(marketingCarrier);
        card.appendChild(comprarButton);

        resultadosDiv.appendChild(card);
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
    botaoProsseguirCompra.removeEventListener('click', mostrarQrCode); // Remove o listener de QR code
    botaoProsseguirCompra.addEventListener('click', prosseguirParaCompra); // Adiciona o listener de redirecionamento
});

document.getElementById('prosseguir').addEventListener('click', prosseguirParaCompra);

function prosseguirParaCompra() {
    if (recaptchaResolvido) {
        // Se o ReCAPTCHA já foi resolvido, podemos prosseguir para a lógica de "Finalizar Compra"
        qrCodeImage.style.opacity = '1'; // Podemos manter essa linha temporariamente para visualização
        botaoProsseguirCompra.textContent = 'Finalizar Compra';
        botaoProsseguirCompra.removeEventListener('click', prosseguirParaCompra);
        botaoProsseguirCompra.addEventListener('click', finalizarCompra);
    } else {
        alert('Por favor, complete a verificação ReCAPTCHA.');
        // Opcional: Você pode adicionar alguma indicação visual para o usuário completar o ReCAPTCHA
    }
}

function onRecaptchaSuccess(token) {
    console.log('ReCAPTCHA resolvido:', token);
    recaptchaResolvido = true;
    botaoProsseguirCompra.textContent = 'Prosseguir para Finalizar';
    botaoProsseguirCompra.removeEventListener('click', prosseguirParaCompra); // Remove o listener antigo
    botaoProsseguirCompra.addEventListener('click', finalizarCompra); // Adiciona o novo listener
}

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
            qrCodeImage.style.opacity = '0';
            botaoProsseguirCompra.textContent = 'Prosseguir'; // Reseta o texto do botão
            botaoProsseguirCompra.removeEventListener('click', finalizarCompra); // Remove este listener
            botaoProsseguirCompra.addEventListener('click', prosseguirParaCompra); // Adiciona o listener de redirecionamento
        });
}

function buscarLinkCompanhiaAerea(nomeCompanhia) {
    if (!apiKey || !searchEngineId) {
        console.error("Chave de API ou ID do mecanismo de pesquisa do Google não configurados.");
        return Promise.resolve(null);
    }

    const query = `${nomeCompanhia}`;
    const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}`;

    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.items && data.items.length > 0) {
                return data.items[0].link;
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