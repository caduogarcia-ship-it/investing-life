// scratch/test-vale3-brapi.mjs
async function test() {
  const symbol = 'VALE3';
  const token = 'cgWz89yC3Q8H8JpDMM7sPZ'; // from test-brapi-history.mjs
  const url = `https://brapi.dev/api/quote/${symbol}?dividends=true&token=${token}`;
  console.log('Fetching', url);
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.log('Fetch failed with status', res.status);
      return;
    }
    const json = await res.json();
    const result = json.results?.[0];
    if (!result) {
      console.log('No results from Brapi');
      return;
    }

    const events = [];
    const cashDividends = result.dividendsData?.cashDividends;
    if (Array.isArray(cashDividends)) {
      cashDividends.forEach(div => {
        if (div.rate > 0 && div.paymentDate) {
          const dateObj = new Date(div.paymentDate);
          events.push({
            date: dateObj.toISOString().split('T')[0],
            amount: Number(div.rate.toFixed(3)),
            month: dateObj.getMonth(),
            year: dateObj.getFullYear(),
            type: 'CASH',
            label: div.label || 'DIVIDENDO'
          });
        }
      });
    }

    console.log(`Parsed ${events.length} events from Brapi.`);
    const yearsRange = [2021, 2022, 2023, 2024, 2025];
    let grandTotal = 0;
    yearsRange.forEach(yr => {
      const yrEvents = events.filter(e => e.year === yr && e.type !== 'STOCK');
      const sum = yrEvents.reduce((acc, e) => acc + e.amount, 0);
      console.log(`Year ${yr}: sum=${sum.toFixed(3)} (events count=${yrEvents.length})`);
      yrEvents.forEach(e => console.log(`  - ${e.date} [${e.label}]: ${e.amount}`));
      grandTotal += Number(sum.toFixed(3));
    });
    console.log(`Grand Total for 2021-2025: ${grandTotal.toFixed(3)}`);
  } catch (e) {
    console.error('Error during test', e);
  }
}
test();
