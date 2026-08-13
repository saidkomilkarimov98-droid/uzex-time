export default function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');

  const serverTime = Date.now();

  response.status(200).json({
    serverTime,
    offsetMs: 0,
    rttMs: 0
  });
}
