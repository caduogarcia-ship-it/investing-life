async function run() {
  const symbol = 'RECV3';
  const token = 'cgWz89yC3Q8H8JpDMM7sPZ';
  try {
    const res = await fetch(`https://brapi.dev/api/quote/${symbol}?token=${token}`);
    const data = await res.json();
    console.log('BRAPI raw response for RECV3:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('BRAPI failed:', e);
  }
}
run();
