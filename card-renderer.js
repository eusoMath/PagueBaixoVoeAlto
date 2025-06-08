import { auth, adicionarVooFavorito, removerVooFavorito } from './firebase.js';
import { inicializarModal } from './purchase-modal.js';

function exibirResultados(listaDeVoos, containerId, favoritosSet = new Set()) {
    const resultadosDiv = document.getElementById(containerId);
    if (!resultadosDiv) return;

    if (document.querySelectorAll(`#${containerId} .card`).length === 0) {
        resultadosDiv.innerHTML = '';
    }

    listaDeVoos.forEach(itinerary => {
        const card = document.createElement('div');
        card.classList.add('card');
        const vooId = btoa(`${itinerary.legs[0].departure}-${itinerary.legs[0].arrival}-${itinerary.price.raw}`);

        const favoritarButton = document.createElement('button');
        favoritarButton.className = 'favoritar-btn';
        if (favoritosSet.has(vooId)) {
            favoritarButton.classList.add('favorited');
            favoritarButton.innerHTML = '&#9733;';
        } else {
            favoritarButton.innerHTML = '&#9734;';
        }

        favoritarButton.addEventListener('click', async () => {
            const user = auth.currentUser;
            if (!user) { alert('Faça login para favoritar.'); return; }
            const isFavorited = favoritarButton.classList.contains('favorited');
            if (isFavorited) {
                await removerVooFavorito(user.uid, vooId);
            } else {
                await adicionarVooFavorito(user.uid, vooId, itinerary);
            }
            favoritarButton.classList.toggle('favorited');
            favoritarButton.innerHTML = favoritarButton.classList.contains('favorited') ? '&#9733;' : '&#9734;';
        });
        
        const price = document.createElement('h3');
        price.textContent = `Preço: ${itinerary.price.formatted}`;
        const departure = document.createElement('p');
        const arrival = document.createElement('p');
        const duration = document.createElement('p');
        const marketingCarrier = document.createElement('p');
        
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

        const comprarButton = document.createElement('button');
        comprarButton.textContent = 'Comprar';
        comprarButton.addEventListener('click', () => {
            inicializarModal(itinerary, departure.textContent, arrival.textContent, duration.textContent, marketingCarrier.textContent);
        });

        card.appendChild(favoritarButton);
        card.appendChild(price);
        card.appendChild(departure);
        card.appendChild(arrival);
        card.appendChild(duration);
        card.appendChild(marketingCarrier);
        card.appendChild(comprarButton);
        resultadosDiv.appendChild(card);
    });
}

export { exibirResultados };