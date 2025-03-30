// autocomplete.js
// Chave API: 0bfc4cee93msh2bf7f105650ac0ep136bcdjsn20c6d63f41d3
// Chave API reserva:c3cef0936cmshc1e136970fdb9a0p1f561fjsn72399617d2cd

const apiKey = 'c3cef0936cmshc1e136970fdb9a0p1f561fjsn72399617d2cd'; // Substitua pela sua API key

let partidaId = '';
let chegadaId = '';

async function buscarSugestoes(termo) {
  const url = `https://skyscanner80.p.rapidapi.com/api/v1/flights/auto-complete?query=${termo}&market=BR&locale=pt-BR`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'skyscanner80.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return result.data || []; // Retorna um array de lugares ou um array vazio
  } catch (error) {
    console.error('Erro ao buscar sugestões:', error);
    return [];
  }
}

async function configurarAutocomplete(inputId, datalistId, idHiddenInputId, idVariable) {
  const inputElement = document.getElementById(inputId);
  const datalistElement = document.getElementById(datalistId);

  inputElement.addEventListener('input', async () => {
    const termo = inputElement.value;
    if (termo.length < 3) {
      datalistElement.innerHTML = ''; // Limpa as sugestões se o termo for curto
      return;
    }

    const sugestoes = await buscarSugestoes(termo);
    datalistElement.innerHTML = ''; // Limpa as sugestões anteriores

    sugestoes.forEach(sugestao => {
      const option = document.createElement('option');
      option.value = sugestao.presentation.suggestionTitle; // Usa suggestionTitle como label
      option.dataset.placeId = sugestao.id; // Armazena o ID no dataset
      datalistElement.appendChild(option);
    });
  });

  inputElement.addEventListener('change', () => {
    const selectedOption = datalistElement.querySelector(`option[value="${inputElement.value}"]`);
    if (selectedOption) {
      if (idVariable === 'partidaId') {
        partidaId = selectedOption.dataset.placeId;
      } else if (idVariable === 'chegadaId') {
        chegadaId = selectedOption.dataset.placeId;
      }
      console.log(`ID selecionado (${idVariable}):`, selectedOption.dataset.placeId);
    } else {
      if (idVariable === 'partidaId') {
        partidaId = '';
      } else if (idVariable === 'chegadaId') {
        chegadaId = '';
      }
    }
  });
}

// Configura os autocompletes para os campos de partida e chegada
configurarAutocomplete('localPartidaInput', 'sugestoesPartida', 'idPartidaHidden', 'partidaId');
configurarAutocomplete('localChegadaInput', 'sugestoesChegada', 'idChegadaHidden', 'chegadaId');

// Exporta as variáveis partidaId e chegadaId
export { partidaId, chegadaId };