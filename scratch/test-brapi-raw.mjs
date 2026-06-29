// scratch/test-brapi-raw.mjs
async function test() {
  const symbol = 'VALE3';
  const token = 'cgWz89yC3Q8H8JpDMM7sPZ';
  const url = `https://brapi.dev/api/quote/${symbol}?dividends=true&token=${token}`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    const result = json.results?.[0];
    const cash = result.dividendsData?.cashDividends || [];
    console.log('Raw Cash Dividends count:', cash.length);
    // Filter for 2021
    const cash2021 = cash.filter(c => c.paymentDate && c.paymentDate.startsWith('2021'));
    console.log('2021 Cash Dividends:', JSON.stringify(cash2021, null, 2));
  } catch (e) {
    console.error(e);
  }
}
test();
