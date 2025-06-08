const AMADEUS_API_KEY = 'HeJPLcwZmM4vq5lPLGuPXDtPYyVLd4AW';
const AMADEUS_API_SECRET = 'VjK3NLvKV8ezOAiF';

let accessToken = null;
let tokenExpiryTime = 0;

async function getAmadeusToken() {
    if (accessToken && Date.now() < tokenExpiryTime) {
        return accessToken;
    }

    const url = 'https://test.api.amadeus.com/v1/security/oauth2/token';
    const body = `grant_type=client_credentials&client_id=${AMADEUS_API_KEY}&client_secret=${AMADEUS_API_SECRET}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body
        });
        if (!response.ok) throw new Error(`Erro de autenticação na Amadeus: ${response.status}`);
        const data = await response.json();
        accessToken = data.access_token;
        tokenExpiryTime = Date.now() + (data.expires_in - 60) * 1000;
        return accessToken;
    } catch (error) {
        console.error("Falha ao obter o token da Amadeus:", error);
        return null;
    }
}

async function buscarSugestoesAmadeus(termo) {
    const token = await getAmadeusToken();
    if (!token) return [];
    const url = `https://test.api.amadeus.com/v1/reference-data/locations?subType=CITY,AIRPORT&keyword=${termo}`;
    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error(`Erro na busca de locais: ${response.status}`);
        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.error("Erro ao buscar sugestões na Amadeus:", error);
        return [];
    }
}

async function buscarVoosAmadeus(partida, chegada, data, adultos) {
    const token = await getAmadeusToken();
    if (!token) return [];
const url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${partida}&destinationLocationCode=${chegada}&departureDate=${data}&adults=${adultos}&currencyCode=BRL&max=20`;
    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error(`Erro na busca de voos: ${response.status}`);
        const result = await response.json();
        return adaptarRespostaAmadeusVoos(result.data, result.dictionaries);
    } catch (error) {
        console.error("Erro ao buscar voos na Amadeus:", error);
        return [];
    }
}

function adaptarRespostaAmadeusVoos(voos, dictionaries) {
    if (!voos) return [];
    return voos.map(voo => {
        const primeiraPerna = voo.itineraries[0].segments[0];
        const ultimaPerna = voo.itineraries[0].segments[voo.itineraries[0].segments.length - 1];
        
        const duracaoTotalEmSegundos = voo.itineraries[0].segments.reduce((acc, segment) => {
            const duracao = segment.duration.replace('PT', '').replace('H', '*3600+').replace('M', '*60+').slice(0, -1);
            return acc + eval(duracao);
        }, 0);
        const duracaoEmMinutos = Math.floor(duracaoTotalEmSegundos / 60);

        return {
            price: {
                raw: parseFloat(voo.price.total),
                formatted: `R$ ${parseFloat(voo.price.total).toFixed(2).replace('.', ',')}`
            },
            legs: [{
                departure: primeiraPerna.departure.at,
                arrival: ultimaPerna.arrival.at,
                durationInMinutes: duracaoEmMinutos,
                carriers: { marketing: [{ name: dictionaries.carriers[voo.validatingAirlineCodes[0]] }] },
                origin: { name: primeiraPerna.departure.iataCode },
                destination: { name: ultimaPerna.arrival.iataCode }
            }]
        };
    });
}

export { buscarSugestoesAmadeus, buscarVoosAmadeus };