const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'x-rapidapi-ua': 'RapidAPI-Playground',
    'x-rapidapi-key': '0bfc4cee93msh2bf7f105650ac0ep136bcdjsn20c6d63f41d3',
    'x-rapidapi-host': 'skyscanner80.p.rapidapi.com'
  };
  
  const url = 'https://partners.api.skyscanner.net/apiservices/v3/autosuggest/flights'; // Substitua pela URL da API
  
  fetch(url, {
    method: 'GET', // ou 'POST', dependendo da API
    headers: headers
  })
    .then(response => response.json())
    .then(data => {
      console.log(data); // Processa os dados da API
    })
    .catch(error => {
      console.error('Erro:', error);
    });