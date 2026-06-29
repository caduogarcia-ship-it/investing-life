import fetch from 'node-fetch';

const token = process.env.VITE_BRAPI_TOKEN || 'cgWz89yC3Q8H8JpDMM7sPZ';
const url = `https://brapi.dev/api/quote/PETR4?range=5y&interval=1mo&token=${token}`;

fetch(url)
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data.results[0].historicalData?.slice(0, 5), null, 2)))
  .catch(console.error);
