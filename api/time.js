const UZEX_TIME_URL = 'https://time.uzex.uz/';

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  try {
    const startedAt = Date.now();
    const upstream = await fetch(UZEX_TIME_URL, {
      headers: { 'Cache-Control': 'no-cache', 'User-Agent': 'UZEX-Time-Mini-App/1.0' },
      signal: AbortSignal.timeout(8_000)
    });
    const html = await upstream.text();
    const receivedAt = Date.now();
    const match = html.match(/id=["']jqclock-remote["'][\s\S]*?<input[^>]*value=["'](\d+(?:\.\d+)?)["']/i);
    if (!match) throw new Error('UZEX server vaqti topilmadi');
    const serverTime = Number(match[1]);
    response.status(200).json({
      serverTime,
      offsetMs: serverTime - ((startedAt + receivedAt) / 2),
      rttMs: receivedAt - startedAt
    });
  } catch {
    response.status(502).json({ error: 'UZEX Time bilan bog‘lanib bo‘lmadi. Keyinroq qayta urinib ko‘ring.' });
  }
}
