export let partidaId = "";
export let chegadaId = "";

// Obtém as referências aos elementos datalist
const sugestoesPartidaLista = document.getElementById("sugestoesPartida");
const sugestoesChegadaLista = document.getElementById("sugestoesChegada");

async function autocomplete(inputElement, datalistElement, idVariable) {
    const query = inputElement.value;

    datalistElement.innerHTML = "";

    if (!query) {
        return;
    }

    const url = `https://skyscanner80.p.rapidapi.com/api/v1/flights/auto-complete?query=${query}&market=BR&locale=pt-BR`;
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

        if (result && result.data && Array.isArray(result.data)) {
            result.data.forEach(item => {
                const option = document.createElement("option");
                option.value = item.presentation.suggestionTitle;
                datalistElement.appendChild(option);

                // Adiciona um ouvinte de evento de clique a cada sugestão
                option.addEventListener("click", function() {
                    inputElement.value = item.presentation.suggestionTitle;
                    datalistElement.innerHTML = "";
                    if (idVariable === partidaId) {
                        partidaId = item.navigation.entityId;
                    } else if (idVariable === chegadaId) {
                        chegadaId = item.navigation.entityId;
                    }
                    console.log("ID selecionado:", item.navigation.entityId);
                    console.log("partidaId:", partidaId, "chegadaId:", chegadaId);
                    document.getElementById("Buscar").disabled = false; // Habilita o botão
                });
            });
        } else {
            console.error("A resposta da API não contém 'data' ou 'data' não é um array.");
        }

    } catch (error) {
        console.error(error);
    }
}

localPartidaInput.addEventListener("input", () => autocomplete(localPartidaInput, sugestoesPartidaLista, partidaId));
localChegadaInput.addEventListener("input", () => autocomplete(localChegadaInput, sugestoesChegadaLista, chegadaId));