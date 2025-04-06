let voosExibidosInicial = 8; // Quantidade inicial de voos a exibir
let todosVoos = []; // Array para armazenar todos os voos carregados
let voosAtualmenteExibidos = []; // Array para rastrear os voos que já estão na tela

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
            console.log('Comprar voo:', itinerary);
            alert('Funcionalidade de compra em desenvolvimento!');
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
        if (!document.getElementById("sect01").contains(mostrarMaisButton)) {
            document.getElementById("sect01").appendChild(mostrarMaisButton);
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
    const sect01 = document.getElementById('sect01');
    if (sect01) {
        sect01.appendChild(mostrarMaisButton);
    } else {
        console.error("Elemento com ID 'sect01' não encontrado no HTML.");
    }

    carregarDados(); // Carrega os dados iniciais ao carregar a página
});