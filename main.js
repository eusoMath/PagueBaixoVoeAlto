import { auth, onAuthStateChanged, lerTodosOsFavoritos } from './firebase.js';
import { buscarVoosAmadeus } from './amadeus-api.js';
import { inicializarAutocomplete, getLugarIds } from './autocomplete.js';
import { exibirResultados } from './card-renderer.js';
import { setupModalListeners } from './purchase-modal.js';

const MODO_TESTE = false;

let todosOsVoosAtuais = [];
let voosAtualmenteExibidos = 0;
const voosPorPagina = 8;
let favoritosDoUsuario = new Set();

async function buscarVoosLocais() {
    try {
        const response = await fetch('./dados-voos.json');
        if (!response.ok) throw new Error(`Erro: ${response.status}`);
        const data = await response.json();
        return data.data.itineraries || [];
    } catch (error) {
        console.error("Erro ao carregar voos locais:", error);
        return [];
    }
}

async function iniciarBusca() {
    const resultadosDiv = document.getElementById("resultados");
    if (!resultadosDiv) return;
    resultadosDiv.innerHTML = '<h2>Buscando voos...</h2>';

    let voosEncontrados = [];

    if (MODO_TESTE) {
        const partidaTexto = document.getElementById("localPartidaInput").value.toLowerCase();
        const chegadaTexto = document.getElementById("localChegadaInput").value.toLowerCase();
        const todosOsVoos = await buscarVoosLocais();
        
        voosEncontrados = todosOsVoos.filter(voo => {
            const origem = (voo.legs[0].origin && voo.legs[0].origin.name) ? voo.legs[0].origin.name.toLowerCase() : '';
            const destino = (voo.legs[0].destination && voo.legs[0].destination.name) ? voo.legs[0].destination.name.toLowerCase() : '';
            return origem.includes(partidaTexto) && destino.includes(chegadaTexto);
        });

    } else {
        const { partidaId, chegadaId } = getLugarIds();
        const dataPartida = document.getElementById("dataDePartida").value;
        const numAdultos = document.getElementById("adultos").value;

        if (!partidaId || !chegadaId || !dataPartida) {
            alert("Por favor, preencha partida, chegada e data.");
            resultadosDiv.innerHTML = '<h3>Preencha todos os campos para iniciar a busca.</h3>';
            return;
        }
        voosEncontrados = await buscarVoosAmadeus(partidaId, chegadaId, dataPartida, numAdultos);
    }

    if (voosEncontrados && voosEncontrados.length > 0) {
        if (!MODO_TESTE) {
            voosEncontrados.sort((a, b) => a.price.raw - b.price.raw);
        }
        todosOsVoosAtuais = voosEncontrados;
        voosAtualmenteExibidos = 0;
        mostrarProximosVoos();
    } else {
        resultadosDiv.innerHTML = '<h2>Nenhum voo encontrado.</h2>';
    }
}

function mostrarProximosVoos() {
    const proximosVoos = todosOsVoosAtuais.slice(voosAtualmenteExibidos, voosAtualmenteExibidos + voosPorPagina);
    exibirResultados(proximosVoos, "resultados", favoritosDoUsuario);
    voosAtualmenteExibidos += voosPorPagina;
    const mostrarMaisButton = document.getElementById("mostrarMaisButton");
    if (mostrarMaisButton) {
        mostrarMaisButton.style.display = (voosAtualmenteExibidos >= todosOsVoosAtuais.length) ? "none" : "block";
    }
    const secaoDeVoos = document.getElementById("sect-1");
    if (secaoDeVoos) {
        secaoDeVoos.style.height = "fit-content";
    }
}
document.addEventListener('DOMContentLoaded', () => {
    inicializarAutocomplete();
    setupModalListeners();
    
    onAuthStateChanged(auth, (user) => {
        if (user) {
            lerTodosOsFavoritos(user.uid).then(favoritos => {
                const favoritosIds = favoritos.map(voo => btoa(`${voo.legs[0].departure}-${voo.legs[0].arrival}-${voo.price.raw}`));
                favoritosDoUsuario = new Set(favoritosIds);
                if (MODO_TESTE) {
                    iniciarBusca();
                }
            });
        } else {
            favoritosDoUsuario.clear();
            if (MODO_TESTE) {
                iniciarBusca();
            }
        }
    });


    document.getElementById("Buscar").addEventListener("click", iniciarBusca);
    document.getElementById("mostrarMaisButton").addEventListener("click", mostrarProximosVoos);


    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => { auth.signOut().then(() => { window.location.href = 'index.html'; }); });
    }
});