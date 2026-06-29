// scratch/test-local-proxy.mjs
async function test() {
  const url = 'http://localhost:5173/investidor10/acoes/vale3/proventos/';
  console.log('Fetching local proxy', url);
  try {
    const res = await fetch(url);
    console.log('Response status:', res.status);
    console.log('Response content-type:', res.headers.get('content-type'));
    const text = await res.text();
    console.log('Length:', text.length);
    console.log('Snippet:', text.slice(0, 500));
  } catch (e) {
    console.error('Fetch failed:', e);
  }
}
test();
