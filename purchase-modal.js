const apiKeyGoogle = 'AIzaSyBepPSla9-WKKzmbp7sXgxB3dajtrbrlRc';
const searchEngineIdGoogle = '61f1a0e3a8cb84fe0';

let recaptchaResolvido = false;
let recaptchaRenderizado = false;

window.onRecaptchaSuccess = function(token) {
    recaptchaResolvido = true;
};

function renderizarRecaptcha() {
    if (recaptchaRenderizado) {
        try { grecaptcha.reset(); } catch (e) { console.error("Erro ao resetar reCAPTCHA", e); }
        return;
    }
    const container = document.getElementById('recaptcha-container');
    if (container && typeof grecaptcha !== 'undefined') {
        grecaptcha.render(container, {
            'sitekey' : '6Lei-zUrAAAAAMkrUl4hhNj9H7V1PLYJwt88CFUo',
            'callback' : 'onRecaptchaSuccess'
        });
        recaptchaRenderizado = true;
    }
}

function prosseguirParaCompra() {
    if (recaptchaResolvido) {
        const botao = document.getElementById('prosseguir');
        botao.textContent = 'Finalizar Compra';
        botao.removeEventListener('click', prosseguirParaCompra);
        botao.addEventListener('click', finalizarCompra);
    } else {
        alert('Por favor, complete a verificação "Não sou um robô".');
    }
}

async function buscarLinkCompanhiaAerea(nomeCompanhia) {
    const query = `${nomeCompanhia} site oficial`;
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKeyGoogle}&cx=${searchEngineIdGoogle}&q=${encodeURIComponent(query)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return (data.items && data.items.length > 0) ? data.items[0].link : null;
    } catch (error) {
        console.error("Erro ao buscar link:", error);
        return null;
    }
}

async function finalizarCompra() {
    const companhiaNome = document.getElementById('companhia').textContent.replace('Companhia: ', '');
    const link = await buscarLinkCompanhiaAerea(companhiaNome);
    if (link) {
        window.open(link, '_blank');
    } else {
        alert(`Não foi possível encontrar o site da ${companhiaNome}.`);
    }
    document.getElementById('caixaDeCompra').style.display = 'none';
}

export function inicializarModal(itinerary, originText, destinationText, departureText, arrivalText, durationText, carrierText) {
    const caixaDeCompra = document.getElementById('caixaDeCompra');
    
    document.getElementById('preco').textContent = `Preço: ${itinerary.price.formatted}`;
    document.getElementById('modal-origem').textContent = originText;
    document.getElementById('modal-destino').textContent = destinationText;
    document.getElementById('partida').textContent = departureText;
    document.getElementById('chegada').textContent = arrivalText;
    document.getElementById('duracao').textContent = durationText;
    document.getElementById('companhia').textContent = carrierText;

    if (caixaDeCompra) {
        caixaDeCompra.style.display = 'block';
        renderizarRecaptcha();
    }
}

export function setupModalListeners() {
    const fecharCaixaButton = document.getElementById('fecharCaixaDeCompra');
    if (fecharCaixaButton) {
        fecharCaixaButton.addEventListener('click', () => {
            const caixa = document.getElementById('caixaDeCompra');
            if (caixa) caixa.style.display = 'none';
            const botao = document.getElementById('prosseguir');
            if (botao) {
                botao.textContent = 'Prosseguir';
                botao.removeEventListener('click', finalizarCompra);
                botao.addEventListener('click', prosseguirParaCompra);
            }
            recaptchaResolvido = false;
        });
    }

    const botaoProsseguir = document.getElementById('prosseguir');
    if (botaoProsseguir) {
        botaoProsseguir.addEventListener('click', prosseguirParaCompra);
    }
}
