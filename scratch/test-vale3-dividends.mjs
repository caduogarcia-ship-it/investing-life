// scratch/test-vale3-dividends.mjs
async function test() {
  const symbol = 'VALE3';
  const url = `https://investidor10.com.br/acoes/${symbol.toLowerCase()}/proventos/`;
  console.log('Fetching', url);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://investidor10.com.br'
      }
    });
    if (!res.ok) {
      console.log('Fetch failed with status', res.status);
      return;
    }
    const htmlText = await res.text();
    
    // Find tbody of table-dividends-history
    const tableRegex = /<table[^>]*id="table-dividends-history"[^>]*>([\s\S]*?)<\/table>/i;
    const tableMatch = htmlText.match(tableRegex);
    if (!tableMatch) {
      console.log('Table #table-dividends-history not found');
      return;
    }
    
    const tbody = tableMatch[1];
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let trMatch;
    let i = 0;
    
    const cleanHtml = (s) => s.replace(/<[^>]*>/g, '').trim();
    
    while ((trMatch = trRegex.exec(tbody)) !== null) {
      const rowContent = trMatch[1];
      const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      let tdMatch;
      const cells = [];
      while ((tdMatch = tdRegex.exec(rowContent)) !== null) {
        cells.push(cleanHtml(tdMatch[1]));
      }
      if (cells.length >= 4) {
        console.log(`Row ${i}: tipo="${cells[0]}", pagamento="${cells[2]}", valor="${cells[3]}"`);
        i++;
      }
    }
  } catch (e) {
    console.error('Error during test', e);
  }
}
test();
