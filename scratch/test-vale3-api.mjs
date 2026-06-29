// scratch/test-vale3-api.mjs
async function test() {
  const symbol = 'VALE3';
  const cleanSymbol = symbol.toUpperCase().trim();
  const cat = 'acoes';
  const url = `https://investidor10.com.br/${cat}/${cleanSymbol.toLowerCase()}/proventos/`;
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
    
    // Simple mock DOMParser replacement using regex
    const tableRegex = /<table[^>]*id="table-dividends-history"[^>]*>([\s\S]*?)<\/table>/i;
    const tableMatch = htmlText.match(tableRegex);
    if (!tableMatch) {
      console.log('Table #table-dividends-history not found');
      return;
    }
    
    const tbody = tableMatch[1];
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let trMatch;
    
    const cleanHtml = (s) => s.replace(/<[^>]*>/g, '').trim();
    const parseDecimal = (s) => {
      if (!s) return 0;
      return parseFloat(s.trim().replace(/\./g, '').replace(',', '.'));
    };
    const parseBrDate = (s) => {
      if (!s) return null;
      const parts = s.trim().split('/');
      if (parts.length !== 3) return null;
      const [dd, mm, yyyy] = parts;
      const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      return isNaN(d.getTime()) ? null : d;
    };

    const events = [];
    while ((trMatch = trRegex.exec(tbody)) !== null) {
      const rowContent = trMatch[1];
      const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      let tdMatch;
      const cells = [];
      while ((tdMatch = tdRegex.exec(rowContent)) !== null) {
        cells.push(cleanHtml(tdMatch[1]));
      }
      if (cells.length >= 4) {
        const tipo = cells[0].toUpperCase();
        const pagamento = cells[2];
        const valor = parseDecimal(cells[3]);
        if (valor <= 0) continue;
        const payDate = parseBrDate(pagamento);
        if (!payDate) continue;
        
        let eventType = 'CASH';
        let label = 'DIVIDENDO';
        if (tipo.includes('JSCP') || tipo.includes('JCP')) {
          label = 'JCP';
        } else if (tipo.includes('REND')) {
          label = 'REND. TRIB.';
        } else if (tipo.includes('BONIF')) {
          eventType = 'STOCK';
          label = 'BONIFICAÇÃO';
        }

        events.push({
          date: payDate.toISOString().split('T')[0],
          amount: eventType === 'STOCK' ? 0 : Number(valor.toFixed(8)),
          month: payDate.getMonth(),
          year: payDate.getFullYear(),
          type: eventType,
          label,
        });
      }
    }

    console.log(`Parsed ${events.length} events.`);
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
