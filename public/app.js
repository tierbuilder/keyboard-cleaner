(() => {
  const $ = id => document.getElementById(id);
  const app = $('app');
  const HOLD_MS = 3000;

  // ---------- Options (remembered per browser) ----------
  const defaults = { duration: 60, dark: true, awake: true, holdPad: true, holdEsc: true, tab: 'timer' };
  let opts = { ...defaults };
  try {
    const saved = JSON.parse(localStorage.getItem('cleanmode-opts') || '{}');
    if ([0, 30, 60, 120, 300].includes(saved.duration)) opts.duration = saved.duration;
    for (const k of ['dark', 'awake', 'holdPad', 'holdEsc']) if (typeof saved[k] === 'boolean') opts[k] = saved[k];
    if (['timer', 'screen', 'unlock', 'tips'].includes(saved.tab)) opts.tab = saved.tab;
  } catch {}
  const save = () => { try { localStorage.setItem('cleanmode-opts', JSON.stringify(opts)); } catch {} };

  // ---------- Detect the computer and browser ----------
  const platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent;
  const detectedOS = /win/i.test(platform) ? 'win' : /mac/i.test(platform) ? 'mac' : null;
  let os = detectedOS || 'mac';
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua) ? 'Edge' : /Firefox\//.test(ua) ? 'Firefox'
    : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'your browser';
  const canLockKeys = !!(navigator.keyboard && navigator.keyboard.lock);

  function checklist() {
    const mac = os === 'mac';
    const mod = mac ? '⌘ shortcuts (⌘W, ⌘Q, ⌘Tab)' : 'Windows key, Alt+Tab, Ctrl+W';
    return [
      ['yes', 'Letters, numbers, arrows, space and enter', 'Blocked.'],
      ['yes', mac ? 'Trackpad clicks, scrolling, pinch and swipe-back' : 'Touchpad and mouse clicks, scrolling and pinch', 'Blocked.'],
      canLockKeys
        ? ['yes', mod, `Blocked while ${browser} is in full screen.`]
        : ['no', mod, `${browser} can't block these. Open this page in Chrome or Edge to block them.`],
      mac
        ? ['setup', 'Volume, brightness and media keys', 'Blocked once you turn on System Settings → Keyboard → Keyboard Shortcuts… → Function Keys → “Use F1, F2, etc. keys as standard function keys”. Turn it off again afterwards.']
        : ['setup', 'Volume, brightness and media keys', 'Blocked once you turn on Fn Lock, usually Fn + Esc or a key with a padlock. No Fn Lock? Look in your laptop maker\'s app (Lenovo Vantage, HP, Dell, MyASUS) or the BIOS.'],
      mac
        ? ['setup', 'Three- and four-finger swipes', 'Mission Control and switching spaces go to macOS. Turn them off in System Settings → Trackpad → More Gestures while you clean.']
        : ['setup', 'Three- and four-finger swipes', 'These go to Windows. Set them to “Nothing” in Settings → Bluetooth & devices → Touchpad while you clean.'],
      mac
        ? ['no', 'fn (🌐) key and Touch ID / power key', 'macOS handles these itself. Wipe them gently or last.']
        : ['no', 'Ctrl+Alt+Del, Fn key and power button', 'Windows handles these itself. Wipe them gently or last.'],
    ];
  }

  function renderChecklist() {
    const name = os === 'mac' ? 'Mac' : 'Windows PC';
    $('detected').innerHTML = detectedOS === os
      ? `Detected: <b>${name}</b> with <b>${browser}</b>`
      : `Showing: <b>${name}</b>`;
    $('osSwitch').textContent = os === 'mac' ? 'Using Windows?' : 'Using a Mac?';
    const icon = { yes: '✓', setup: '!', no: '✕' };
    const label = { yes: 'Blocked', setup: 'Needs a setting', no: 'Not blocked' };
    $('checklist').innerHTML = checklist().map(([k, what, why]) =>
      `<li><span class="mark ${k}" title="${label[k]}" aria-label="${label[k]}">${icon[k]}</span><span><div class="what">${what}</div><div class="why">${why}</div></span></li>`
    ).join('');
  }

  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const durLabel = s => s === 0 ? null : s < 60 ? `${s} seconds` : s === 60 ? '1 minute' : `${s / 60} minutes`;

  function renderOptions() {
    document.querySelectorAll('#durations button').forEach(b => b.setAttribute('aria-pressed', +b.dataset.s === opts.duration));
    $('optDark').checked = opts.dark;
    $('optAwake').checked = opts.awake;
    // With no time limit, one unlock method must stay on.
    if (opts.duration === 0 && !opts.holdPad && !opts.holdEsc) opts.holdEsc = true;
    $('optHoldPad').checked = opts.holdPad;
    $('optHoldEsc').checked = opts.holdEsc;
    app.dataset.os = os;
    renderChecklist();
    document.querySelectorAll('.tabs button').forEach(b => {
      const on = b.id === 'tab-' + opts.tab;
      b.setAttribute('aria-selected', on);
      $(b.getAttribute('aria-controls')).hidden = !on;
    });
    $('caption').textContent = 'Locks right away. ' + caption();
    $('hint').textContent = hintText();
    save();
  }

  function unlockPhrase() {
    const ways = [];
    if (opts.holdEsc) ways.push('hold esc');
    if (opts.holdPad) ways.push('press and hold the trackpad');
    return ways.length ? ways.join(' or ') + ' for 3 seconds' : '';
  }
  function caption() {
    const t = durLabel(opts.duration), u = unlockPhrase();
    if (t && u) return `Unlocks after ${t}, or ${u}.`;
    if (t) return `Unlocks after ${t}.`;
    return `To unlock, ${u}.`;
  }
  function hintText() {
    const u = unlockPhrase();
    return u ? u[0].toUpperCase() + u.slice(1) + ' to unlock.' : 'Unlocks when the timer ends.';
  }

  $('durations').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { opts.duration = +b.dataset.s; renderOptions(); } });
  $('osSwitch').addEventListener('click', () => { os = os === 'mac' ? 'win' : 'mac'; renderOptions(); });
  document.querySelector('.tabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { opts.tab = b.id.slice(4); renderOptions(); } });
  $('optDark').addEventListener('change', e => { opts.dark = e.target.checked; renderOptions(); });
  $('optAwake').addEventListener('change', e => { opts.awake = e.target.checked; renderOptions(); });
  $('optHoldPad').addEventListener('change', e => { opts.holdPad = e.target.checked; renderOptions(); });
  $('optHoldEsc').addEventListener('change', e => { opts.holdEsc = e.target.checked; renderOptions(); });
  renderOptions();

  // ---------- Lock ----------
  let locked = false, startedAt = 0, endAt = 0, tick = null, wakeLock = null;
  let blocked = 0, holdStart = 0, holdRaf = null, dimTimer = null;

  function start() {
    blocked = 0; renderCount();
    $('result').hidden = true;
    $('lock').classList.toggle('light', !opts.dark);
    $('timeBar').hidden = opts.duration === 0;
    $('warn').hidden = true;

    // Lock first; full screen, keyboard lock and wake lock are extras that may be refused or never answer.
    try {
      Promise.resolve(app.requestFullscreen({ navigationUI: 'hide' }))
        .then(() => navigator.keyboard && navigator.keyboard.lock && navigator.keyboard.lock())
        .catch(() => { if (locked && !document.fullscreenElement) $('warn').hidden = false; });
    } catch { $('warn').hidden = false; }
    if (opts.awake) { try { navigator.wakeLock.request('screen').then(l => { wakeLock = l; }).catch(() => {}); } catch {} }

    locked = true;
    startedAt = Date.now();
    endAt = opts.duration ? startedAt + opts.duration * 1000 : 0;
    $('setup').hidden = true;
    $('lock').hidden = false;
    try { history.pushState(null, '', location.href); } catch {}
    wake();
    update();
    tick = setInterval(update, 200);
  }

  function update() {
    const now = Date.now();
    // Backstop for hold-to-unlock in case animation frames are paused.
    if (holdStart && now - holdStart >= HOLD_MS) return stop('Unlocked early.');
    if (endAt) {
      const left = Math.max(0, (endAt - now) / 1000);
      $('time').textContent = fmt(Math.ceil(left));
      $('timeFill').style.width = (100 * (1 - left / opts.duration)) + '%';
      if (left <= 0) stop('Time is up.');
    } else {
      $('time').textContent = fmt((now - startedAt) / 1000);
    }
  }

  function stop(reason) {
    if (!locked) return;
    locked = false;
    clearInterval(tick); clearTimeout(dimTimer); endHold();
    try { navigator.keyboard && navigator.keyboard.unlock && navigator.keyboard.unlock(); } catch {}
    try { wakeLock && wakeLock.release(); } catch {}
    wakeLock = null;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    const secs = Math.round((Date.now() - startedAt) / 1000);
    $('resultText').textContent = `All clean. ${reason} Blocked ${blocked} input${blocked === 1 ? '' : 's'} in ${fmt(secs)}.`;
    $('result').hidden = false;
    $('lock').hidden = true;
    $('setup').hidden = false;
  }

  // Status card fades so the black screen shows smudges, and wakes up on any input.
  function wake() {
    $('status').classList.remove('dim');
    clearTimeout(dimTimer);
    dimTimer = setTimeout(() => $('status').classList.add('dim'), 2500);
  }

  function renderCount() { $('counter').textContent = `${blocked} input${blocked === 1 ? '' : 's'} blocked`; }
  function count() { blocked++; renderCount(); wake(); }

  function ripple(x, y) {
    const r = document.createElement('div');
    r.className = 'ripple';
    r.style.left = x + 'px'; r.style.top = y + 'px';
    $('lock').appendChild(r);
    setTimeout(() => r.remove(), 800);
  }

  // ---------- Hold to unlock (esc key or trackpad press) ----------
  let holdKind = null;
  function beginHold(kind) {
    if (holdStart) return;
    holdKind = kind; holdStart = Date.now(); wake();
    const loop = () => {
      if (!holdStart) return;
      const p = Math.min(1, (Date.now() - holdStart) / HOLD_MS);
      $('holdFill').style.width = (p * 100) + '%';
      $('status').classList.remove('dim');
      if (p >= 1) return stop('Unlocked early.');
      holdRaf = requestAnimationFrame(loop);
    };
    loop();
  }
  function endHold(kind) {
    if (kind && kind !== holdKind) return;
    holdStart = 0; holdKind = null;
    cancelAnimationFrame(holdRaf);
    $('holdFill').style.width = '0';
    if (locked) wake();
  }

  // ---------- Input blocking ----------
  window.addEventListener('keydown', e => {
    if (!locked) return;
    e.preventDefault(); e.stopPropagation();
    if (e.key === 'Escape' && opts.holdEsc) return beginHold('esc');
    if (!e.repeat) { count(); ripple(Math.random() * innerWidth, Math.random() * innerHeight); }
  }, true);
  window.addEventListener('keyup', e => {
    if (!locked) return;
    e.preventDefault();
    if (e.key === 'Escape') endHold('esc');
  }, true);
  window.addEventListener('keypress', e => { if (locked) e.preventDefault(); }, true);

  const swallow = e => { if (!locked) return; e.preventDefault(); e.stopPropagation(); };
  ['mousedown', 'click', 'dblclick', 'auxclick', 'contextmenu', 'dragstart', 'selectstart',
   'touchstart', 'touchmove', 'gesturestart', 'gesturechange', 'gestureend']
    .forEach(t => window.addEventListener(t, swallow, { capture: true, passive: false }));

  window.addEventListener('pointerdown', e => {
    if (!locked) return;
    swallow(e); count(); ripple(e.clientX, e.clientY);
    if (opts.holdPad && e.button === 0) beginHold('pad');
  }, { capture: true, passive: false });
  ['pointerup', 'pointercancel', 'mouseup'].forEach(t => window.addEventListener(t, e => {
    if (!locked) return; swallow(e); endHold('pad');
  }, { capture: true, passive: false }));

  let lastWheel = 0;
  window.addEventListener('wheel', e => {
    if (!locked) return;
    e.preventDefault();
    if (Date.now() - lastWheel > 400) { count(); lastWheel = Date.now(); }
  }, { capture: true, passive: false });

  window.addEventListener('popstate', () => { if (locked) try { history.pushState(null, '', location.href); } catch {} });
  window.addEventListener('beforeunload', e => { if (locked) { e.preventDefault(); e.returnValue = ''; } });
  document.addEventListener('fullscreenchange', () => { if (locked && !document.fullscreenElement) { $('warn').hidden = false; wake(); } });
  document.addEventListener('visibilitychange', async () => {
    if (locked && opts.awake && document.visibilityState === 'visible') { try { wakeLock = await navigator.wakeLock.request('screen'); } catch {} }
  });

  $('startBtn').addEventListener('click', start);
})();
