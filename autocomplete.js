//API ORIGINAL = 0bfc4cee93msh2bf7f105650ac0ep136bcdjsn20c6d63f41d3
//API RESERVA = c3cef0936cmshc1e136970fdb9a0p1f561fjsn72399617d2cd

const apiKey = 'c3cef0936cmshc1e136970fdb9a0p1f561fjsn72399617d2cd';

let partidaId = '';
let chegadaId = '';

async function buscarSugestoes(termo) {
  const url = `https://skyscanner80.p.rapidapi.com/api/v1/flights/auto-complete?query=${termo}&market=BR&locale=pt-BR&currency=BRL`;
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
    return result.data || [];
  } catch (error) {
    console.error('Erro ao buscar sugestões:', error);
    return [];
  }
}

async function configurarAutocomplete(inputId, datalistId, idVariable) {
  const inputElement = document.getElementById(inputId);
  const datalistElement = document.getElementById(datalistId);

  if (!inputElement || !datalistElement) {
    console.error(`Elemento de input ou datalist não encontrado para: ${inputId}`);
    return;
  }

  inputElement.addEventListener('input', async () => {
    const termo = inputElement.value;
    if (termo.length < 3) {
      datalistElement.innerHTML = '';
      return;
    }

    const sugestoes = await buscarSugestoes(termo);
    datalistElement.innerHTML = '';

    sugestoes.forEach(sugestao => {
      const option = document.createElement('option');
      option.value = sugestao.presentation.suggestionTitle;
      option.dataset.placeId = sugestao.id;
      datalistElement.appendChild(option);
    });
  });

  inputElement.addEventListener('change', () => {
    const selectedOption = Array.from(datalistElement.options).find(opt => opt.value === inputElement.value);

    if (selectedOption && selectedOption.dataset.placeId) {
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

document.addEventListener('DOMContentLoaded', () => {
    configurarAutocomplete('localPartidaInput', 'sugestoesPartida', 'partidaId');
    configurarAutocomplete('localChegadaInput', 'sugestoesChegada', 'chegadaId');
});