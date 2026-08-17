(() => {
  const tg = window.Telegram?.WebApp;
  tg?.ready(); tg?.expand();
  const clock = document.querySelector('#clock');
  const hand = document.querySelector('#hand');
  const milliseconds = document.querySelector('#milliseconds');
  const status = document.querySelector('#status');
  const stopButton = document.querySelector('#stopButton');
  const syncButton = document.querySelector('#syncButton');
  let offsetMs = 0, manualOffsetMs = Number(localStorage.getItem('uzex-time-manual-offset')) || 0, frozen = false, frozenTimestamp = 0, signalEnabled = true, lastSignalSecond = -1;
  let audioContext;
  const format = timestamp => { const value = Math.round(timestamp); return new Intl.DateTimeFormat('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false }).format(value) + '.' + String(value % 1000).padStart(3, '0'); };
  const render = timestamp => {
    const value = Math.round(timestamp);
    const ms = ((value % 1000) + 1000) % 1000;
    clock.textContent = format(value);
    milliseconds.textContent = String(ms).padStart(3, '0');
    hand.style.transform = `rotate(${ms * 0.36}deg)`;
  };
  const beep = () => {
    try { audioContext ??= new AudioContext(); const osc = audioContext.createOscillator(); const gain = audioContext.createGain(); osc.frequency.value = 1047; gain.gain.setValueAtTime(.05, audioContext.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + .05); osc.connect(gain).connect(audioContext.destination); osc.start(); osc.stop(audioContext.currentTime + .06); } catch {}
    tg?.HapticFeedback?.impactOccurred('light');
  };
  const tick = () => {
    const now = frozen ? frozenTimestamp : Date.now() + offsetMs + manualOffsetMs;
    render(now);
    const value = Math.round(now), second = Math.floor(value / 1000), ms = value % 1000;
    if (!frozen && signalEnabled && ms >= 850 && second !== lastSignalSecond) { beep(); lastSignalSecond = second; }
    requestAnimationFrame(tick);
  };
  async function sync() {
    syncButton.disabled = true; status.textContent = 'UZEX vaqti bilan sinxronlanmoqda…';
    try {
      const response = await fetch('/api/time', { cache:'no-store' });
      const raw = await response.text();
      const receivedAt = Date.now();
let data;
try {
  data = JSON.parse(raw);
} catch {
  throw new Error(raw.slice(0, 180));
}
      if (!response.ok) throw new Error(data.error);
      offsetMs = data.offsetMs;
      status.textContent = `Sinxronlandi: tuzatish ${offsetMs >= 0 ? '+' : ''}${offsetMs.toFixed(1)} ms, RTT ${data.rttMs} ms`;
    } catch (error) { status.textContent = error.message || 'Sinxronlash amalga oshmadi.'; }
    finally { syncButton.disabled = false; }
  }
  stopButton.addEventListener('click', () => {
    frozen = !frozen;
    if (frozen) { frozenTimestamp = Math.round(Date.now() + offsetMs + manualOffsetMs); stopButton.textContent = 'Davom ettirish'; status.textContent = `To‘xtadi: ${format(frozenTimestamp)}`; tg?.HapticFeedback?.notificationOccurred('success'); }
    else { stopButton.textContent = 'To‘xtatish'; status.textContent = 'Mashq davom etmoqda.'; tg?.HapticFeedback?.impactOccurred('light'); }
  });
  syncButton.addEventListener('click', sync);
    const calibration = document.createElement('div');
  calibration.style.cssText = 'margin:12px 0;color:#b4c0d1;text-align:center;font:14px system-ui';
  calibration.innerHTML = `
    <p id="manualOffsetText" style="margin:0 0 8px"></p>
    <button id="minusMs" type="button">−10 ms</button>
    <button id="resetMs" type="button">Reset</button>
    <button id="plusMs" type="button">+10 ms</button>
  `;

  document.querySelector('.controls').before(calibration);

  const updateManualOffset = () => {
    localStorage.setItem('uzex-time-manual-offset', String(manualOffsetMs));
    document.querySelector('#manualOffsetText').textContent =
      `Qo‘lda tuzatish: ${manualOffsetMs >= 0 ? '+' : ''}${manualOffsetMs} ms`;
  };

  document.querySelector('#minusMs').addEventListener('click', () => {
    manualOffsetMs -= 10;
    updateManualOffset();
  });

  document.querySelector('#plusMs').addEventListener('click', () => {
    manualOffsetMs += 10;
    updateManualOffset();
  });

  document.querySelector('#resetMs').addEventListener('click', () => {
    manualOffsetMs = 0;
    updateManualOffset();
  });

  updateManualOffset();
  document.addEventListener('pointerdown', () => audioContext?.resume(), { once:true });
  sync(); requestAnimationFrame(tick);
})();
