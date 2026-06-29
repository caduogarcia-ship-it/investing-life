const symbols = ['^BVSP', 'IFIX.SA', 'USDBRL=X', '^GSPC', '^IXIC', 'BTC-USD'];
const token = 'cgWz89yC3Q8H8JpDMM7sPZ';

async function test() {
  for (const sym of symbols) {
    try {
      const res = await fetch(`https://brapi.dev/api/quote/${sym}?token=${token}`);
      const json = await res.json();
      console.log(sym, '=>', json.error ? `ERROR: ${json.error}` : (json.results ? json.results[0]?.regularMarketPrice : 'NO RESULTS'));
    } catch (e) {
      console.log(sym, '=> ERROR', e.message);
    }
  }
}
test();
