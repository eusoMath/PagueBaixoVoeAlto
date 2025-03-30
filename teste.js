async function carregarDados() {
    try {
      const response = await fetch('dados-voos.json');
      if (!response.ok) {
        throw new Error(`Erro ao carregar dados: ${response.status}`);
      }
      const dados = await response.json();
      exibirResultados(dados);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }
  
  function exibirResultados(dados) {
    let resultadosDiv = document.getElementById('resultados');
    if (!resultadosDiv) {
      resultadosDiv = document.createElement('div');
      resultadosDiv.id = 'resultados';
      document.querySelector('section').appendChild(resultadosDiv);
    }
    resultadosDiv.innerHTML = '';
  
    if (dados && dados.data && dados.data.itineraries) {
      dados.data.itineraries.forEach(itinerary => {
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
  
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'Comparar';
        checkbox.id = 'Comparar' + itinerary.id;
  
        card.appendChild(price);
        card.appendChild(departure);
        card.appendChild(arrival);
        card.appendChild(duration);
        card.appendChild(marketingCarrier);
        card.appendChild(comprarButton);
        card.appendChild(checkbox);
  
        resultadosDiv.appendChild(card);
      });
    } else {
      resultadosDiv.textContent = 'Nenhum resultado encontrado.';
    }
  }
  
  function compararVoos() {
      const resultadosDiv = document.getElementById('resultados');
  
      if (!resultadosDiv) {
          console.error("Elemento 'resultados' não encontrado.");
          return;
      }
  
      const voosParaComparar = voosSelecionados.map(index => {
          if (index >= 0 && index < resultadosDiv.children.length && resultadosDiv.children[index]) {
              const cardElement = resultadosDiv.children[index];
              if (cardElement) {
                  return cardElement.cloneNode(true);
              } else {
                  console.error(`Elemento do card não encontrado para o índice: ${index}`);
                  return null;
              }
          } else {
              console.error(`Índice inválido ou elemento não encontrado: ${index}`);
              return null;
          }
      }).filter(card => card !== null);
  
      const sectionComparacao = document.createElement('section');
      sectionComparacao.id = 'comparacao';
  
      voosParaComparar.forEach(card => {
          sectionComparacao.appendChild(card);
      });
  
      document.body.appendChild(sectionComparacao);
  
      // Limpa a lista de voos selecionados após a comparação
      voosSelecionados = [];
  }
  
  document.getElementById('Buscar').addEventListener('click', carregarDados);
  
  const voosSelecionados = [];
const checkboxes = document.querySelectorAll('input[name="Comparar"]');

checkboxes.forEach(checkbox => {
    checkbox.addEventListener('click', () => {
        const card = checkbox.closest('.card');
        const cardId = card.id;

        if (checkbox.checked) {
            if (voosSelecionados.length < 2) {
                voosSelecionados.push(cardId);
                document.getElementById('comparador').style.display = 'block';
            } else {
                checkbox.checked = false;
                alert('Você pode comparar apenas 2 voos.');
            }
        } else {
            const index = voosSelecionados.indexOf(cardId);
            if (index > -1) {
                voosSelecionados.splice(index, 1);
            }
        }

        if (voosSelecionados.length === 0) {
            document.getElementById('comparador').style.display = 'none';
        }

        if (voosSelecionados.length === 2) {
            compararVoos();
        }
    });
});