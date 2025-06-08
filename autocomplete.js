import { buscarSugestoesAmadeus } from './amadeus-api.js';

let partidaId = '';
let chegadaId = '';
let debounceTimeout;

function configurarAutocomplete(inputId, datalistId, idVariable) {
  const inputElement = document.getElementById(inputId);
  const datalistElement = document.getElementById(datalistId);
  if (!inputElement || !datalistElement) return;

  inputElement.addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    const termo = inputElement.value;
    if (termo.length < 3) { datalistElement.innerHTML = ''; return; }
    debounceTimeout = setTimeout(async () => {
      const sugestoes = await buscarSugestoesAmadeus(termo);
      datalistElement.innerHTML = '';
      if (sugestoes) {
        sugestoes.forEach(sugestao => {
          const option = document.createElement('option');
          option.value = `${sugestao.name} (${sugestao.iataCode})`;
          option.dataset.placeId = sugestao.iataCode;
          datalistElement.appendChild(option);
        });
      }
    }, 500);
  });

  inputElement.addEventListener('change', () => {
    const selectedOption = Array.from(datalistElement.options).find(opt => opt.value === inputElement.value);
    let iataCode = '';
    if (selectedOption && selectedOption.dataset.placeId) { iataCode = selectedOption.dataset.placeId; }
    if (idVariable === 'partidaId') { partidaId = iataCode; } 
    else if (idVariable === 'chegadaId') { chegadaId = iataCode; }
  });
}

function getLugarIds() {
    return { partidaId, chegadaId };
}

export function inicializarAutocomplete() {
    configurarAutocomplete('localPartidaInput', 'sugestoesPartida', 'partidaId');
    configurarAutocomplete('localChegadaInput', 'sugestoesChegada', 'chegadaId');
}

export { getLugarIds };