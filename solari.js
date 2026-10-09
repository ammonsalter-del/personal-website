/* ammonsalter mock v2, 7 October 2026. Two things:
   1. Letter boards (.solari): each row is a set of character cells that flip from blank to the text, as a station board spells
      a destination. Markup: <div class="solari"><div class="row" data-cells="4,32,26"><span>2017</span><span>...</span></div></div>
   2. The picture board on the home page (#wall): the picture-tile engine from The Slingshot's website reel
      (SOLARI LOGO 04-10/src/website-board.src.html, 5 Oct 2026) with the frames changed. No rocket, no logo film.
   Sound: "pragotron_split-flap-display.wav" by matucha, https://freesound.org/s/174056/, CC BY-NC 4.0 (sounds.js). Off until switched on. */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- sound ----------
  var AC = window.AudioContext || window.webkitAudioContext, actx = null, bufs = [], soundOn = false, clip = 0, cur = null, GAIN = 0.3;
  function initAudio() {
    if (actx || !AC || !window.FLAP_SOUNDS) return;
    actx = new AC();
    window.FLAP_SOUNDS.forEach(function (u, i) {
      var bin = atob(u.split(',')[1]), buf = new Uint8Array(bin.length);
      for (var j = 0; j < bin.length; j++) buf[j] = bin.charCodeAt(j);
      new Promise(function (res, rej) { var p = actx.decodeAudioData(buf.buffer, res, rej); if (p && p.then) p.then(res, rej); })
        .then(function (b) { bufs[i] = b; }, function () {});
    });
  }
  function playFlap(len) {
    var b = bufs[clip]; clip = (clip + 1) % (window.FLAP_SOUNDS ? window.FLAP_SOUNDS.length : 1);
    if (!soundOn || !actx || actx.state !== 'running' || !b) return;
    if (cur) cur.gain.setTargetAtTime(0, actx.currentTime, 0.06);
    var s = actx.createBufferSource(), g = actx.createGain(), t0 = actx.currentTime;
    g.gain.setValueAtTime(GAIN, t0); g.gain.setTargetAtTime(0, t0 + len, 0.08);
    s.buffer = b; s.connect(g); g.connect(actx.destination); s.start(t0); s.stop(t0 + len + 0.6);
    cur = g;
  }
  function setSound(on) {
    soundOn = on;
    if (on) { initAudio(); if (actx && actx.state === 'suspended') actx.resume(); }
    try { sessionStorage.setItem('solari-sound', on ? '1' : '0'); } catch (e) {}
    document.querySelectorAll('[data-sound]').forEach(function (b) { b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.textContent = on ? 'Sound on' : 'Sound off'; });
  }
  document.querySelectorAll('[data-sound]').forEach(function (b) { b.addEventListener('click', function () { setSound(!soundOn); }); });
  try { if (sessionStorage.getItem('solari-sound') === '1') { soundOn = true; document.querySelectorAll('[data-sound]').forEach(function (b) { b.setAttribute('aria-pressed', 'true'); b.textContent = 'Sound on'; }); } } catch (e) {}
  // a browser only lets sound start after a click or key: the first one on the page wakes it when Sound is already on
  function wake() { if (soundOn) { initAudio(); if (actx && actx.state === 'suspended') actx.resume(); } }
  document.addEventListener('pointerdown', wake, { once: true }); document.addEventListener('keydown', wake, { once: true });

  // ---------- 1. letter boards ----------
  var ALPHA = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,:\'&-/()?!*';
  var STEP_MS = 48;
  function cellHtml() {
    return '<span class="half top"><span>&nbsp;</span></span><span class="half bottom"><span>&nbsp;</span></span>' +
      '<span class="leaf ltop"><span>&nbsp;</span></span><span class="leaf lbottom"><span>&nbsp;</span></span>';
  }
  function norm(ch) {   // the board's alphabet; letters it has no tile for show as a blank
    ch = ch.toUpperCase();
    var map = { '–': '-', '—': '-', '’': '\'', 'É': 'E', 'é': 'E', 'Ö': 'O', 'ö': 'O' };
    if (map[ch]) ch = map[ch];
    return ALPHA.indexOf(ch) >= 0 ? ch : ' ';
  }
  // Two kinds of board. Page titles (.title) and the small year tiles (.inline) spell their text one letter tile at a time.
  // Every other board (.lines, added here) is lines of ordinary text: each column of a row is one wide flap that turns
  // through a few other lines of the same column before it lands, as a station board changes a destination.
  // (His word, 8 Oct: the letter-tile lists were very hard to read.)
  var LINE_MS = 150;
  function buildBoard(board) {
    var lines = !board.classList.contains('title') && !board.classList.contains('inline');
    if (lines) board.classList.add('lines');
    var rows = board.querySelectorAll('.row'), cells = [], colTexts = [], stag = Math.min(110, 2000 / rows.length);   // a long board lands within about two and a half seconds
    if (lines) rows.forEach(function (row) {
      Array.prototype.slice.call(row.children).forEach(function (seg, si) { (colTexts[si] = colTexts[si] || []).push(seg.textContent.replace(/\s+/g, ' ').trim()); });
    });
    rows.forEach(function (row, ri) {
      var counts = (row.getAttribute('data-cells') || '').split(',').map(function (n) { return parseInt(n, 10); });
      var segs = Array.prototype.slice.call(row.children), text = row.textContent.replace(/\s+/g, ' ').trim();
      row.setAttribute('aria-label', segs.map(function (s) { return s.textContent.trim(); }).join(', '));
      row.setAttribute('role', 'img');
      var link = row.getAttribute('data-href'), host = row;
      if (link) { host = document.createElement('a'); host.className = 'rowlink'; host.href = link; if (/^https?:/.test(link)) { host.target = '_blank'; host.rel = 'noopener'; } }
      var frag = document.createDocumentFragment();
      segs.forEach(function (seg, si) {
        var n = counts[si] || seg.textContent.length, t = seg.textContent.replace(/\s+/g, ' ').trim(), y = seg.hasAttribute('data-y');
        var sw = document.createElement('span'); sw.className = 'seg'; sw.setAttribute('aria-hidden', 'true');
        if (lines) {
          sw.style.width = (n + 3) + 'ch';
          sw.innerHTML = '<span class="size"></span>' + cellHtml();
          sw.querySelector('.size').textContent = t || ' ';
          var others = (colTexts[si] || []).filter(function (o) { return o && o !== t; }), seq = [''];
          var turns = others.length ? 1 + (ri % 3) : 0;
          for (var k = 0; k < turns; k++) seq.push(others[Math.floor(Math.random() * others.length)]);
          seq.push(t);
          cells.push({ el: sw, seq: seq, target: seq.length - 1, ms: LINE_MS, delay: ri * stag + si * 70 + Math.random() * 80 });
        } else {
          for (var i = 0; i < n; i++) {
            var c = document.createElement('span'); c.className = 'cell' + (y ? ' y' : ''); c.innerHTML = cellHtml();
            sw.appendChild(c);
            cells.push({ el: c, seq: null, target: ALPHA.indexOf(norm(t[i] || ' ')), ms: STEP_MS, delay: ri * 70 + i * 12 + Math.random() * 60 });
          }
        }
        frag.appendChild(sw);
      });
      row.textContent = '';
      if (link) { host.appendChild(frag); row.appendChild(host); } else row.appendChild(frag);
    });
    board._cells = cells; board._done = false;
    if (reduce) setNow(board);
  }
  function setCell(c, ch) {
    var s = ch === ' ' ? ' ' : ch, el = c.el;
    el.querySelector('.top > span').textContent = s; el.querySelector('.bottom > span').textContent = s;
    el.querySelector('.ltop').style.visibility = 'hidden'; el.querySelector('.lbottom').style.visibility = 'hidden';
  }
  function chr(c, k) { return c.seq ? c.seq[k] : ALPHA[k]; }
  function setNow(board) { board._cells.forEach(function (c) { setCell(c, chr(c, c.target)); }); board._done = true; }
  function runBoard(board) {
    if (board._done) return; board._done = true;
    var cells = board._cells, longest = 0, t0 = null;
    cells.forEach(function (c) {
      var el = c.el;
      c.top = el.querySelector('.top > span'); c.bot = el.querySelector('.bottom > span');
      c.ltop = el.querySelector('.ltop'); c.lbot = el.querySelector('.lbottom'); c.ltopS = c.ltop.firstChild; c.lbotS = c.lbot.firstChild;
      c.landed = false; longest = Math.max(longest, c.target * c.ms + c.delay);
    });
    playFlap(Math.min(2.2, 0.3 + longest / 1000));
    function tick(now) {
      if (t0 === null) t0 = now;
      var alive = false;
      for (var k = 0; k < cells.length; k++) {
        var c = cells[k]; if (c.landed) continue;
        var u = (now - t0 - c.delay) / c.ms;
        if (u < 0) { alive = true; continue; }
        var step = Math.floor(u), p = u - step;
        if (step >= c.target) {
          setCell(c, chr(c, c.target)); c.landed = true; continue;
        }
        alive = true;
        var from = chr(c, step), to = chr(c, step + 1);
        from = from === ' ' ? ' ' : from; to = to === ' ' ? ' ' : to;
        c.top.textContent = to; c.bot.textContent = from; c.ltopS.textContent = from; c.lbotS.textContent = to;
        c.ltop.style.visibility = 'visible'; c.lbot.style.visibility = 'visible';
        if (p < 0.5) { c.ltop.style.transform = 'rotateX(' + (-90 * (p / 0.5)) + 'deg)'; c.lbot.style.transform = 'rotateX(90deg)'; }
        else { c.ltop.style.transform = 'rotateX(-90deg)'; c.lbot.style.transform = 'rotateX(' + (90 - 90 * ((p - 0.5) / 0.5)) + 'deg)'; }
      }
      if (alive) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var boards = Array.prototype.slice.call(document.querySelectorAll('.solari'));
  boards.forEach(buildBoard);
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { runBoard(en.target); io.unobserve(en.target); } }); }, { threshold: 0, rootMargin: '0px 0px -80px 0px' });
    boards.forEach(function (b) { io.observe(b); });
  } else boards.forEach(setNow);

  // ---------- 2. the picture board (home page only) ----------
  var canvas = document.getElementById('wall');
  if (!canvas || !window.PICTURE_FRAMES) return;
  var FRAMES = window.PICTURE_FRAMES, N = FRAMES.length, MANUAL = !!window.BOARD_MANUAL, SHAPE = window.BOARD_SHAPE || { cols: 16, rows: 10 };
  var COLS = SHAPE.cols, ROWS = SHAPE.rows, TS = 63, TG = 1, PERS = 1100;
  var BW = COLS * TS + (COLS - 1) * TG, BH = ROWS * TS + (ROWS - 1) * TG;
  var board = { x: 30, y: 30, w: BW, h: BH }, W = BW + 60, H = BH + 60;
  var SETTLED_GRID = 0.3, FLIP = 0.32, SPREAD = 0.55, LOOK = 0.25, T_FIRST = 2.6, STEP = 2.9;
  var PAGE_T = []; for (var pi = 1; pi < N; pi++) PAGE_T.push(T_FIRST + (pi - 1) * STEP);
  var T_END = T_FIRST + (N - 1) * STEP, TOTAL = T_END + 1.3;
  var ctx = canvas.getContext('2d');
  var capEl = document.getElementById('caption'), playBtn = document.getElementById('play'), replayBtn = document.getElementById('replay');
  var prevBtn = document.getElementById('prev'), nextBtn = document.getElementById('next');
  var BOARD_FONT = '"Barlow Condensed", "Arial Narrow", "Helvetica Neue", Arial, sans-serif';

  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function mk(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function rr(c, x, y, w, h, r) { c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r); c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h); c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath(); }
  function loadImg(src) { return new Promise(function (res, rej) { var i = new Image(); i.onload = function () { res(i); }; i.onerror = rej; i.src = src; }); }
  var tiles = [];
  for (var r0 = 0; r0 < ROWS; r0++) for (var c0 = 0; c0 < COLS; c0++)
    tiles.push({ c: c0, r: r0, w: TS, h: TS, bu: (c0 + 0.5) / COLS, bv: (r0 + 0.5) / ROWS, face0: FRAMES[0].id, last: FRAMES[0].id, flips: [], x: board.x + c0 * (TS + TG), y: board.y + r0 * (TS + TG) });
  var tilePath = new Path2D(); rr(tilePath, 0, 0, TS, TS, 1);
  var pics = {};
  function addPic(id, img) {
    var p = { img: img, w: img.naturalWidth || img.width, h: img.naturalHeight || img.height }, ba = BW / BH, ia = p.w / p.h, cv = {};
    if (ia > ba) { cv.sh = p.h; cv.sw = p.h * ba; cv.sx = (p.w - cv.sw) / 2; cv.sy = 0; } else { cv.sw = p.w; cv.sh = p.w / ba; cv.sx = 0; cv.sy = (p.h - cv.sh) / 2; }
    p.cover = cv; pics[id] = p;
  }
  function fit(g, weight, text, maxW, maxPx) { g.font = weight + ' 100px ' + BOARD_FONT; var px = Math.min(maxPx, 100 * maxW / g.measureText(text).width); g.font = weight + ' ' + px + 'px ' + BOARD_FONT; return px; }
  // text frames: white letters on the board's black, as a station board
  function nightField(g, seed, accent) {
    var R = rng(seed);
    g.fillStyle = '#1e1632'; g.fillRect(0, 0, BW, BH);
    var glow = g.createRadialGradient(BW * 0.5, BH * 0.5, 0, BW * 0.5, BH * 0.5, BW * 0.6);
    glow.addColorStop(0, accent + '1c'); glow.addColorStop(1, accent + '00');
    g.fillStyle = glow; g.fillRect(0, 0, BW, BH);
    for (var i = 0; i < 70; i++) {
      var sx = R() * BW, sy = R() * BH, a = (0.1 + R() * 0.35).toFixed(2), rad = 0.5 + R() * 1.3;
      g.fillStyle = 'rgba(205,230,255,' + a + ')'; g.beginPath(); g.arc(sx, sy, rad, 0, 7); g.fill();
    }
  }
  function textFrame(t) {
    var S = 2, c = mk(BW * S, BH * S), g = c.getContext('2d'); g.scale(S, S);
    var accent = t.accent || '#6fe8f3', pad = 60, inner = BW - 2 * pad;
    nightField(g, 7 + (t.big || 'n').length, accent);
    g.textBaseline = 'alphabetic'; g.textAlign = 'left'; g.fillStyle = '#eeeaff';
    if (t.kind === 'name') {
      fit(g, '700', t.big, inner, 190); g.fillText(t.big, pad, BH * 0.47);
      g.fillStyle = accent; g.fillRect(pad, BH * 0.47 + 22, 120, 3);
      g.font = '500 36px ' + BOARD_FONT; g.fillStyle = '#c9c4f2';
      t.lines.forEach(function (l, i) { g.fillText(l, pad, BH * 0.47 + 76 + i * 42); });
      return c;
    }
    // a book without its cover yet, or a game without its picture: title, lines
    g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(pad, 70, 290, BH - 140);
    g.strokeStyle = 'rgba(255,255,255,0.14)'; g.strokeRect(pad + 0.5, 70.5, 289, BH - 141);
    var x = pad + 320, y = 150, words = t.big.split(' '), line = '';
    g.fillStyle = '#eeeaff'; g.font = '700 54px ' + BOARD_FONT;
    words.forEach(function (w) { var test = line ? line + ' ' + w : w; if (g.measureText(test).width > inner - 320) { g.fillText(line, x, y); y += 60; line = w; } else line = test; });
    g.fillText(line, x, y); y += 60;
    g.fillStyle = accent; g.fillRect(x, y - 36, 120, 3);
    g.font = '500 30px ' + BOARD_FONT; g.fillStyle = '#c9c4f2';
    t.lines.forEach(function (l, i) { g.fillText(l, x, y + 8 + i * 40); });
    g.font = '500 22px ' + BOARD_FONT; g.fillStyle = '#8a86b0'; g.fillText(t.note || 'Cover to come', pad + 70, BH / 2 + 8);
    return c;
  }
  var R0 = rng(20261007), soundTimes = [];
  var patterns = { radial: function (t) { return Math.hypot(t.bu - 0.5, t.bv - 0.5) / 0.71; }, sweepLR: function (t) { return t.bu * 0.8 + t.bv * 0.2; }, sweepRL: function (t) { return (1 - t.bu) * 0.8 + t.bv * 0.2; }, down: function (t) { return t.bv * 0.7 + t.bu * 0.3; }, fromLeft: function (t) { return Math.hypot(t.bu, (t.bv - 0.5) * 0.62) / 1.05; }, scatter: function () { return R0(); } };
  function change(t, to, pattern, spread) { tiles.forEach(function (tl) { var s = t + pattern(tl) * spread + R0() * 0.1; tl.flips.push({ t0: s, d: FLIP, from: tl.last, to: to }); tl.last = to; }); soundTimes.push(t); }
  function buildReel() {
    var pats = [patterns.sweepLR, patterns.down, patterns.fromLeft, patterns.scatter, patterns.sweepRL, patterns.radial];
    PAGE_T.forEach(function (t, i) { change(t, FRAMES[i + 1].id, pats[i % pats.length], SPREAD); });
    change(T_END, FRAMES[0].id, patterns.radial, 0.6);
  }
  var scale = 1, dpr = 1, bg = null, gTop = null, gBot = null, GAP = '#120e1a';
  function makeBackground() {
    bg = mk(canvas.width, canvas.height);
    var g = bg.getContext('2d'), m = scale * dpr, b = board;
    g.setTransform(m, 0, 0, m, 0, 0);
    g.clearRect(0, 0, W, H);
    g.fillStyle = '#1e1632'; g.fillRect(0, 0, W, H);
    g.save(); g.shadowColor = 'rgba(0,0,0,0.55)'; g.shadowBlur = 46 * m; g.shadowOffsetY = 14 * m;
    g.beginPath(); rr(g, b.x - 18, b.y - 18, b.w + 36, b.h + 36, 16); g.fillStyle = '#140e25'; g.fill(); g.restore();
    g.beginPath(); rr(g, b.x - 18, b.y - 18, b.w + 36, b.h + 36, 16); g.lineWidth = 1.5; g.strokeStyle = 'rgba(170,190,255,0.12)'; g.stroke();
    g.beginPath(); rr(g, b.x - 5, b.y - 5, b.w + 10, b.h + 10, 9); g.fillStyle = '#08060f'; g.fill();
    g.fillStyle = GAP; g.fillRect(b.x, b.y, b.w, b.h);
    gTop = ctx.createLinearGradient(0, 0, 0, TS / 2); gTop.addColorStop(0, 'rgba(255,255,255,0.05)'); gTop.addColorStop(1, 'rgba(255,255,255,0)');
    gBot = ctx.createLinearGradient(0, TS / 2, 0, TS); gBot.addColorStop(0, 'rgba(0,0,0,0)'); gBot.addColorStop(1, 'rgba(0,0,0,0.14)');
  }
  var still = null;
  function stateAt(tl, t) {
    if (still) return { face: still, f: null, since: 1e9 };
    var face = tl.face0, fl = tl.flips, done = -1e9;
    for (var i = 0; i < fl.length; i++) { var f = fl[i]; if (t >= f.t0 + f.d) { face = f.to; done = f.t0 + f.d; } else if (t >= f.t0) return { face: face, f: f, p: (t - f.t0) / f.d, since: 0 }; else break; }
    return { face: face, f: null, since: t - done };
  }
  function src(p, tl) { var cv = p.cover; return { sx: cv.sx + (tl.x - board.x) / BW * cv.sw, sy: cv.sy + (tl.y - board.y) / BH * cv.sh, sw: TS / BW * cv.sw, sh: TS / BH * cv.sh, p: p }; }
  function blit(s, fy0, fy1, dx, dy, dw, dh) { var p = s.p, sx = Math.max(0, s.sx), sy = Math.max(0, s.sy + fy0 * s.sh); var sw = Math.min(s.sw, p.w - sx), sh = Math.min((fy1 - fy0) * s.sh, p.h - sy); if (sw > 0 && sh > 0 && dw > 0 && dh > 0) ctx.drawImage(p.img, sx, sy, sw, sh, dx, dy, dw, dh); }
  function flapAngle(p) { if (p < 0.5) return { half: 0, a: 90 * Math.pow(p / 0.5, 1.6) }; var q = (p - 0.5) / 0.5; return { half: 1, a: q < 0.75 ? 90 * (1 - Math.pow(q / 0.75, 2)) : 7 * Math.sin(Math.PI * (q - 0.75) / 0.25) }; }
  function drawFlap(s, tl, half, deg) {
    var a = deg * Math.PI / 180, sn = Math.sin(a), cs = Math.cos(a), hh = tl.h / 2, ym = tl.y + hh, cx = tl.x + tl.w / 2, NN = 6;
    for (var i = 0; i < NN; i++) {
      var d0 = i / NN * hh, d1 = (i + 1) / NN * hh, k0 = PERS / (PERS - d0 * sn), k1 = PERS / (PERS - d1 * sn);
      var y0 = half ? ym + d0 * cs * k0 : ym - d0 * cs * k0, y1 = half ? ym + d1 * cs * k1 : ym - d1 * cs * k1;
      var ww = tl.w * (k0 + k1) / 2, top = Math.min(y0, y1), hg = Math.abs(y1 - y0); if (hg < 0.05) continue;
      var f0 = half ? (hh + d0) / tl.h : (hh - d1) / tl.h, f1 = half ? (hh + d1) / tl.h : (hh - d0) / tl.h;
      blit(s, f0, f1, cx - ww / 2, top - 0.3, ww, hg + 0.6);
    }
    var kf = PERS / (PERS - hh * sn), yf = half ? ym + hh * cs * kf : ym - hh * cs * kf;
    ctx.beginPath(); ctx.moveTo(tl.x, ym); ctx.lineTo(tl.x + tl.w, ym); ctx.lineTo(cx + tl.w * kf / 2, yf); ctx.lineTo(cx - tl.w * kf / 2, yf); ctx.closePath();
    ctx.fillStyle = 'rgba(0,0,0,' + (half ? 0.5 * sn : 0.45 * Math.pow(sn, 1.4)).toFixed(3) + ')'; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,' + (0.10 * (1 - sn)).toFixed(3) + ')'; ctx.fillRect(cx - tl.w * kf / 2, half ? yf - 1 : yf, tl.w * kf, 1);
  }
  function render(t) {
    if (!bg || !canvas.width) return;
    var m = scale * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(bg, 0, 0);
    ctx.setTransform(m, 0, 0, m, 0, 0); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    var flaps = [];
    for (var i = 0; i < tiles.length; i++) {
      var tl = tiles[i], st = stateAt(tl, t), hh = tl.h / 2;
      if (!st.f) {
        var f = Math.min(1, st.since / LOOK), look = 1 - f, g = look + f * SETTLED_GRID;
        var ex = tl.c < COLS - 1 ? TG : 0, ey = tl.r < ROWS - 1 ? TG : 0, s0 = src(pics[st.face], tl), p = s0.p, kx = s0.sw / TS, ky = s0.sh / TS;
        ctx.drawImage(p.img, s0.sx, s0.sy, Math.min(s0.sw + ex * kx, p.w - s0.sx), Math.min(s0.sh + ey * ky, p.h - s0.sy), tl.x, tl.y, TS + ex, TS + ey);
        if (g > 0) { ctx.fillStyle = GAP; ctx.globalAlpha = g; if (ex) ctx.fillRect(tl.x + TS, tl.y, ex, TS + ey); if (ey) ctx.fillRect(tl.x, tl.y + TS, TS, ey); ctx.globalAlpha = 1; }
        if (look > 0) { ctx.save(); ctx.translate(tl.x, tl.y); ctx.globalAlpha = look; ctx.fillStyle = gTop; ctx.fillRect(0, 0, TS, hh); ctx.fillStyle = gBot; ctx.fillRect(0, hh, TS, hh); ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(0, 0, TS, 1); ctx.restore(); }
        ctx.fillStyle = 'rgba(0,0,0,' + (0.1 * g + 0.5 * look).toFixed(3) + ')'; ctx.fillRect(tl.x, tl.y + hh - 0.5, TS, 1);
        continue;
      }
      var topS = src(pics[st.f.to], tl), botS = src(pics[st.f.from], tl);
      ctx.save(); ctx.translate(tl.x, tl.y); ctx.clip(tilePath); ctx.translate(-tl.x, -tl.y);
      blit(topS, 0, 0.5, tl.x, tl.y, tl.w, hh + 0.5); blit(botS, 0.5, 1, tl.x, tl.y + hh, tl.w, hh);
      var fa = flapAngle(st.p), shade = fa.half ? 0.3 * (1 - fa.a / 90) : 0.35 * (1 - fa.a / 90);
      ctx.fillStyle = 'rgba(0,0,0,' + shade.toFixed(3) + ')'; if (fa.half) ctx.fillRect(tl.x, tl.y + hh, tl.w, hh); else ctx.fillRect(tl.x, tl.y, tl.w, hh);
      flaps.push({ tl: tl, s: src(pics[fa.half ? st.f.to : st.f.from], tl), fa: fa });
      ctx.translate(tl.x, tl.y); ctx.fillStyle = gTop; ctx.fillRect(0, 0, tl.w, hh); ctx.fillStyle = gBot; ctx.fillRect(0, hh, tl.w, hh);
      ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(0, 0, tl.w, 1); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(0, hh + 0.75, tl.w, 0.8); ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, hh - 0.5, tl.w, 1);
      ctx.restore();
    }
    for (var j = 0; j < flaps.length; j++) drawFlap(flaps[j].s, flaps[j].tl, flaps[j].fa.half, flaps[j].fa.a);
  }
  function frameAt(t) { if (t >= T_END) return 0; for (var i = PAGE_T.length - 1; i >= 0; i--) if (t >= PAGE_T[i]) return i + 1; return 0; }
  var capIdx = null;
  function setCaption(i) { if (i === capIdx) return; capIdx = i; capEl.textContent = FRAMES[i].caption || ' '; }
  var raf = 0, e = 0, lastNow = null, playing = false, stillIdx = 0, stillTimer = 0;
  function show(ee) { render(ee); setCaption(frameAt(ee)); }
  function frame(now) {
    var dt = lastNow === null ? 0 : Math.min(0.1, (now - lastNow) / 1000); lastNow = now;
    var e0 = e; e = Math.min(TOTAL, e + dt);
    var due = soundTimes.filter(function (s) { return s > e0 && s <= e; }); if (dt > 0 && due.length) playFlap(1.0);
    show(e);
    if (e >= TOTAL) { raf = 0; finish(); return; }
    raf = requestAnimationFrame(frame);
  }
  function setPlayLabel() { playBtn.textContent = playing ? 'Pause' : 'Play'; }
  function finish() { var had = document.activeElement === playBtn; playing = false; setPlayLabel(); clearInterval(stillTimer); playBtn.hidden = true; replayBtn.hidden = false; if (had) replayBtn.focus(); }
  function play() {
    playBtn.hidden = false; replayBtn.hidden = true; playing = true; setPlayLabel();
    if (still) { stillTimer = setInterval(function () { if (stillIdx >= N - 1) finish(); else stillGo(1); }, 6000); return; }
    lastNow = null; cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
  }
  function pause() { if (cur && actx) { cur.gain.cancelScheduledValues(actx.currentTime); cur.gain.setTargetAtTime(0, actx.currentTime, 0.03); } playing = false; setPlayLabel(); cancelAnimationFrame(raf); raf = 0; clearInterval(stillTimer); }
  function replay() { e = 0; lastNow = null; stillIdx = 0; if (still) { still = FRAMES[0].id; show(0); } play(); }
  function stillGo(d) { stillIdx = Math.max(0, Math.min(N - 1, stillIdx + d)); still = FRAMES[stillIdx].id; render(0); setCaption(stillIdx); }
  // manual mode (the cartoons): Previous and Next turn the board to another frame, one change at a time
  var cur = 0, endAt = 0, mraf = 0, mLast = null;
  var mPats = [patterns.sweepLR, patterns.down, patterns.fromLeft, patterns.scatter, patterns.sweepRL, patterns.radial];
  function mFrame(now) {
    var dt = mLast === null ? 0 : Math.min(0.1, (now - mLast) / 1000); mLast = now; e += dt; render(e);
    if (e < endAt) mraf = requestAnimationFrame(mFrame); else { mraf = 0; mLast = null; }
  }
  function goTo(i) {
    if (still) { stillIdx = i; still = FRAMES[i].id; render(0); setCaption(i); cur = i; return; }
    if (i === cur) return;
    var t0 = Math.max(e, endAt) + 0.05;
    change(t0, FRAMES[i].id, mPats[i % mPats.length], SPREAD);
    endAt = t0 + SPREAD + 0.1 + FLIP + LOOK + 0.05; cur = i; setCaption(i); playFlap(1.0);
    document.querySelectorAll('[data-frame]').forEach(function (b) { b.setAttribute('aria-current', parseInt(b.getAttribute('data-frame'), 10) === i ? 'true' : 'false'); });
    if (!mraf) { mLast = null; mraf = requestAnimationFrame(mFrame); }
  }
  if (MANUAL) {
    prevBtn.addEventListener('click', function () { goTo((cur - 1 + N) % N); });
    nextBtn.addEventListener('click', function () { goTo((cur + 1) % N); });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'ArrowRight') goTo((cur + 1) % N); if (ev.key === 'ArrowLeft') goTo((cur - 1 + N) % N); });
    document.querySelectorAll('[data-frame]').forEach(function (b) { b.addEventListener('click', function () { goTo(parseInt(b.getAttribute('data-frame'), 10)); }); });
  } else {
    playBtn.addEventListener('click', function () { if (playing) pause(); else play(); });
    replayBtn.addEventListener('click', replay);
    prevBtn.addEventListener('click', function () { stillGo(-1); }); nextBtn.addEventListener('click', function () { stillGo(1); });
  }
  function layout() {
    var avail = Math.min(canvas.parentNode.clientWidth, window.BOARD_MAXW || 1100); if (!(avail > 0)) return; scale = avail / W; dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * scale * dpr); canvas.height = Math.round(H * scale * dpr);
    canvas.style.width = Math.round(W * scale) + 'px'; canvas.style.height = Math.round(H * scale) + 'px';
    makeBackground(); show(still ? 0 : e);
  }
  var fontsReady = (document.fonts && document.fonts.load) ? Promise.all([document.fonts.load('700 100px "Barlow Condensed"'), document.fonts.load('500 100px "Barlow Condensed"')]).catch(function () {}) : Promise.resolve();
  Promise.all([fontsReady].concat(FRAMES.filter(function (f) { return f.img; }).map(function (f) { return loadImg(f.img).then(function (im) { addPic(f.id, im); }); })))
    .then(function () {
      FRAMES.forEach(function (f) { if (f.text) addPic(f.id, textFrame(f.text)); });
      if (MANUAL) {
        if (reduce) still = FRAMES[0].id;
        prevBtn.hidden = false; nextBtn.hidden = false; playBtn.hidden = true;
        layout(); window.addEventListener('resize', layout); setCaption(0);
        return;
      }
      buildReel();
      if (reduce) { still = FRAMES[0].id; prevBtn.hidden = false; nextBtn.hidden = false; }
      layout(); window.addEventListener('resize', layout);
      var started = false; function start() { if (started) return; started = true; play(); }
      if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) start(); }); }, { threshold: 0.3 }).observe(canvas); else start();
    }, function () { capEl.textContent = 'The board could not load its pictures.'; });
})();
