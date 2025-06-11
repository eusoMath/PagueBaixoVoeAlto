import { auth, onAuthStateChanged, lerTodosOsFavoritos } from './firebase.js';
import { buscarVoosAmadeus } from './amadeus-api.js';
import { inicializarAutocomplete, getLugarIds } from './autocomplete.js';
import { exibirResultados } from './card-renderer.js';
import { setupModalListeners } from './purchase-modal.js';

let modoTesteAtivo = false;
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
    
    const formBusca = document.querySelector('.container');
    
    resultadosDiv.innerHTML = '<h2>Buscando voos...</h2>';
    let voosEncontrados = [];

    if (modoTesteAtivo) {
        if(formBusca) formBusca.style.display = 'none';
        const todosOsVoos = await buscarVoosLocais();
        voosEncontrados = todosOsVoos;
    } else {
        if(formBusca) formBusca.style.display = 'flex';
        const { partidaId, chegadaId } = getLugarIds();
        const dataPartida = document.getElementById("dataDePartida").value;
        const numAdultos = document.getElementById("adultos").value;
        if (!partidaId || !chegadaId || !dataPartida) {
            resultadosDiv.innerHTML = '<h3>Preencha todos os campos para iniciar a busca.</h3>';
            return;
        }
        voosEncontrados = await buscarVoosAmadeus(partidaId, chegadaId, dataPartida, numAdultos);
    }
    
    resultadosDiv.innerHTML = '';
    if (voosEncontrados && voosEncontrados.length > 0) {
        todosOsVoosAtuais = voosEncontrados;
        voosAtualmenteExibidos = 0;
        const secaoDeResultados = document.getElementById("sect-1");
        if (secaoDeResultados) secaoDeResultados.style.height = 'auto';
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

    const secaoDeResultados = document.getElementById("sect1");
    if (secaoDeResultados) {
        secaoDeResultados.style.height = "fit-content";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const toggleSwitch = document.getElementById('modo-teste-toggle');
    
    const modoSalvo = localStorage.getItem('modoTeste');
    modoTesteAtivo = modoSalvo === 'true';
    if(toggleSwitch) {
        toggleSwitch.checked = modoTesteAtivo;

        toggleSwitch.addEventListener('change', (event) => {
            modoTesteAtivo = event.target.checked;
            localStorage.setItem('modoTeste', modoTesteAtivo);
            iniciarBusca();
        });
    }
    
    inicializarAutocomplete();
    setupModalListeners();
    
    onAuthStateChanged(auth, (user) => {
        if (user) {
            lerTodosOsFavoritos(user.uid).then(favoritos => {
                const favoritosIds = favoritos.map(voo => btoa(`${voo.legs[0].departure}-${voo.legs[0].arrival}-${voo.price.raw}`));
                favoritosDoUsuario = new Set(favoritosIds);
                iniciarBusca();
            });
        } else {
            favoritosDoUsuario.clear();
            iniciarBusca();
        }
    });

    const buscarButton = document.getElementById("Buscar");
    if(buscarButton) buscarButton.addEventListener("click", iniciarBusca);
    
    const mostrarMaisButton = document.getElementById("mostrarMaisButton");
    if(mostrarMaisButton) mostrarMaisButton.addEventListener("click", mostrarProximosVoos);

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => { auth.signOut().then(() => { window.location.href = 'index.html'; }); });
    }
});
