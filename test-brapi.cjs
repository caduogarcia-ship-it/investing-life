const fetch = require('node-fetch');
const symbols = ['^BVSP', 'IFIX.SA', 'USDBRL=X', '^GSPC', '^IXIC', 'BTC-USD'];
async function test() {
  for (const sym of symbols) {
    try {
      const res = await fetch(`https://brapi.dev/api/quote/${sym}`);
      const data = await res.json();
      console.log(sym, data.results?.[0]?.regularMarketPrice || data.error);
    } catch (e) {
      console.error(sym, 'Failed');
    }
  }
}
test();
