async function run() {
  const url = 'https://investidor10.com.br/acoes/recv3/';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log('Status:', res.status);
    console.log('Content-Type:', res.headers.get('content-type'));
    const text = await res.text();
    console.log('HTML preview (first 500 chars):', text.slice(0, 500));
  } catch (e) {
    console.error('Fetch failed:', e);
  }
}
run();
