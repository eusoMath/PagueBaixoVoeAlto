import { partidaId, chegadaId } from './autocomplete.js';

async function buscarVoo() {
    let data = document.getElementById("dataDePartida").value;

    if (!partidaId || !chegadaId || !data) {
        console.error("Por favor, selecione os locais de partida e chegada e a data.");
        return;
    }

    console.log("partidaId (antes da codificação):", partidaId, "chegadaId (antes da codificação):", chegadaId);

    // Codifica os IDs em Base64
    const encodedPartidaId = btoa(JSON.stringify({
        s: partidaId.substring(0, 4),
        e: partidaId.substring(4),
        h: partidaId.substring(4)
    }));
    const encodedChegadaId = btoa(JSON.stringify({
        s: chegadaId.substring(0, 4),
        e: chegadaId.substring(4),
        h: chegadaId.substring(4)
    }));

    console.log("partidaId (após a codificação):", encodedPartidaId, "chegadaId (após a codificação):", encodedChegadaId);

    const url = `https://skyscanner80.p.rapidapi.com/api/v1/flights/search-one-way?fromId=${encodedPartidaId}&toId=${encodedChegadaId}&departDate=${data}&market=BR&locale=pt-BR`;

    console.log("URL da requisição de busca de voos:", url);

    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': '0bfc4cee93msh2bf7f105650ac0ep136bcdjsn20c6d63f41d3',
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
        exibirResultados(result);

    } catch (error) {
        console.error("Erro ao buscar voos:", error);
    }
}

function exibirResultados(dados) {
    let resultadosDiv = document.getElementById("resultados");
    if (!resultadosDiv) {
        resultadosDiv = document.createElement("div");
        resultadosDiv.id = "resultados";
        document.querySelector("section").appendChild(resultadosDiv);
    }
    resultadosDiv.innerHTML = JSON.stringify(dados, null, 2);
}

document.getElementById("Buscar").addEventListener("click", function() {
    if (!partidaId || !chegadaId || !document.getElementById("dataDePartida").value) {
        alert("Por favor, selecione os locais de partida e chegada e a data.");
        return;
    }
    buscarVoo();
});