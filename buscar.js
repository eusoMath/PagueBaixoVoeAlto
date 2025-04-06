//API ORIGINAL = 0bfc4cee93msh2bf7f105650ac0ep136bcdjsn20c6d63f41d3
//API RESERVA = c3cef0936cmshc1e136970fdb9a0p1f561fjsn72399617d2cd

const apiKey = "c3cef0936cmshc1e136970fdb9a0p1f561fjsn72399617d2cd"

import { partidaId, chegadaId } from './autocomplete.js';

let voosExibidos = 5; // Quantidade inicial de voos exibidos
let cache = {}; // Objeto para armazenar os resultados da API em cache

async function buscarVoo() {
    let data = document.getElementById("dataDePartida").value;
    let adultos = document.getElementById("adultos").value;
    let criancas = document.getElementById("criancas").value;
    let bebes = document.getElementById("bebes").value;
    let classeCabine = document.getElementById("classeCabine").value;

    if (!partidaId || !chegadaId || !data) {
        console.error("Por favor, selecione os locais de partida e chegada e a data.");
        return;
    }

    console.log("partidaId (antes da codificação):", partidaId, "chegadaId (antes da codificação):", chegadaId);

    const url = `https://skyscanner80.p.rapidapi.com/api/v1/flights/search-one-way?fromId=${partidaId}&toId=${chegadaId}&departDate=${data}&adults=${adultos}&children=${criancas}&infants=${bebes}&cabinClass=${classeCabine}&market=BR&locale=pt-BR&currency=BRL`;

    console.log("URL da requisição de busca de voos:", url);

    // Verifica se os resultados estão em cache
    if (cache[url]) {
        console.log("Resultados encontrados em cache.");
        exibirResultados(cache[url]);
        return;
    }

    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'skyscanner80.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }

        const result = await response.json();
        console.log(result);

        // Armazena os resultados em cache
        cache[url] = result;

        exibirResultados(result);

    } catch (error) {
        console.error("Erro ao buscar voos:", error);
    }
}

function exibirResultados(dados) {
    let resultadosDiv = document.getElementById("resultados");
    /*
    if (!resultadosDiv) {
        resultadosDiv = document.createElement("div");
        resultadosDiv.id = "resultados";
        document.querySelector("section").appendChild(resultadosDiv);
    }
    */
    resultadosDiv.innerHTML = ''; // Limpa os resultados anteriores
    if (dados && dados.data && dados.data.itineraries) {
        // Ordena os itinerários por preço (do menor para o maior)
        dados.data.itineraries.sort((a, b) => a.price.raw - b.price.raw);

        // Exibe apenas os primeiros 'voosExibidos' voos
        dados.data.itineraries.slice(0, voosExibidos).forEach(itinerary => {
            const card = document.createElement("div");
            card.classList.add("card");

            const price = document.createElement("h3");
            price.textContent = `Preço: ${itinerary.price.formatted}`;

            const departureDate = new Date(itinerary.legs[0].departure);
            const arrivalDate = new Date(itinerary.legs[0].arrival);

            const formattedDepartureDate = departureDate.toLocaleDateString('pt-BR');
            const formattedDepartureTime = departureDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const formattedArrivalDate = arrivalDate.toLocaleDateString('pt-BR');
            const formattedArrivalTime = arrivalDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            const departure = document.createElement("p");
            departure.textContent = `Partida: ${formattedDepartureDate} - ${formattedDepartureTime}`;

            const arrival = document.createElement("p");
            arrival.textContent = `Chegada: ${formattedArrivalDate} - ${formattedArrivalTime}`;

            // Formata a duração
            const durationMinutes = itinerary.legs[0].durationInMinutes;
            const hours = Math.floor(durationMinutes / 60);
            const minutes = durationMinutes % 60;
            const formattedDuration = `${hours}h ${minutes}m`;

            const duration = document.createElement("p");
            duration.textContent = `Duração: ${formattedDuration}`;

            const marketingCarrier = document.createElement("p");
            marketingCarrier.textContent = `Companhia Aérea: ${itinerary.legs[0].carriers.marketing[0].name}`;
            const comprarButton = document.createElement("button");
            comprarButton.textContent = "Comprar";
            comprarButton.addEventListener("click", () => {
                // Adicione aqui a lógica para lidar com a compra do voo
                console.log("Comprar voo:", itinerary);
                alert("Funcionalidade de compra em desenvolvimento!")
                // Você pode redirecionar o usuário para uma página de compra, por exemplo
                // window.location.href = "/pagina-de-compra?id=" + itinerary.id;
            });

            

            card.appendChild(price);
            card.appendChild(departure);
            card.appendChild(arrival);
            card.appendChild(duration);
            card.appendChild(marketingCarrier);
            card.appendChild(comprarButton);

            resultadosDiv.appendChild(card);
        });

        // Adiciona o botão "Mostrar Mais" se houver mais voos para exibir
        if (voosExibidos < dados.data.itineraries.length) {
            const mostrarMaisButton = document.getElementById("mostrarMaisButton");
            mostrarMaisButton.style.display = "block";
            mostrarMaisButton.addEventListener("click", () => {
                voosExibidos += 4; // Aumenta a quantidade de voos exibidos
                document.getElementById("sect1").style.height = "fit-content";
                exibirResultados(dados); // Atualiza a exibição dos voos
            });
            document.getElementById("sect01").appendChild(mostrarMaisButton);
        }
    } else {
        resultadosDiv.textContent = "Nenhum resultado encontrado.";
    }
}


document.getElementById("Buscar").addEventListener("click", function() {
    if (!partidaId || !chegadaId || !document.getElementById("dataDePartida").value) {
        alert("Por favor, selecione os locais de partida e chegada e a data.");
        return;
    }
    voosExibidos = 8; // Reseta a quantidade de voos exibidos ao clicar em "Buscar"
    buscarVoo();
});