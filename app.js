(() => {
  const tg = window.Telegram?.WebApp;
  tg?.ready(); tg?.expand();
  const clock = document.querySelector('#clock');
  const hand = document.querySelector('#hand');
  const milliseconds = document.querySelector('#milliseconds');
  const status = document.querySelector('#status');
  const stopButton = document.querySelector('#stopButton');
  const syncButton = document.querySelector('#syncButton');
  let offsetMs = 0, frozen = false, frozenTimestamp = 0, signalEnabled = true, lastSignalSecond = -1;
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
    const now = frozen ? frozenTimestamp : Date.now() + offsetMs;
    render(now);
    const value = Math.round(now), second = Math.floor(value / 1000), ms = value % 1000;
    if (!frozen && signalEnabled && ms >= 800 && second !== lastSignalSecond) { beep(); lastSignalSecond = second; }
    requestAnimationFrame(tick);
  };
  async function sync() {
    syncButton.disabled = true; status.textContent = 'UZEX vaqti bilan sinxronlanmoqda…';
    try {
      const response = await fetch('/api/time', { cache:'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      offsetMs = data.offsetMs;
      status.textContent = `Sinxronlandi: tuzatish ${offsetMs >= 0 ? '+' : ''}${offsetMs.toFixed(1)} ms, RTT ${data.rttMs} ms`;
    } catch (error) { status.textContent = error.message || 'Sinxronlash amalga oshmadi.'; }
    finally { syncButton.disabled = false; }
  }
  stopButton.addEventListener('click', () => {
    frozen = !frozen;
    if (frozen) { frozenTimestamp = Math.round(Date.now() + offsetMs); stopButton.textContent = 'Davom ettirish'; status.textContent = `To‘xtadi: ${format(frozenTimestamp)}`; tg?.HapticFeedback?.notificationOccurred('success'); }
    else { stopButton.textContent = 'To‘xtatish'; status.textContent = 'Mashq davom etmoqda.'; tg?.HapticFeedback?.impactOccurred('light'); }
  });
  syncButton.addEventListener('click', sync);
  document.addEventListener('pointerdown', () => audioContext?.resume(), { once:true });
  sync(); requestAnimationFrame(tick);
})();
