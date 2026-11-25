// DM TradeMaster Pro — site vitrine : langue FR/EN, menu, apparitions, graphique décoratif.
// Aucune bibliothèque externe. Le graphique du haut est une ILLUSTRATION : données fictives.
(function () {
  'use strict'
  var root = document.documentElement
  root.classList.remove('no-js')
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  /* ------------------------------------------------------------------ langue */
  var EN = window.DM_EN || {}
  var originals = {}
  function applyLang(lang) {
    root.lang = lang
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n')
      if (!(key in originals)) originals[key] = el.innerHTML
      el.innerHTML = lang === 'en' && EN[key] ? EN[key] : originals[key]
    })
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var parts = pair.split(':')
        var attr = parts[0]
        var key = parts[1]
        var store = 'attr:' + key
        if (!(store in originals)) originals[store] = el.getAttribute(attr)
        el.setAttribute(attr, lang === 'en' && EN[key] ? EN[key] : originals[store])
      })
    })
    var titleKey = document.body.getAttribute('data-title-key')
    if (titleKey) {
      if (!('title' in originals)) originals.title = document.title
      document.title = lang === 'en' && EN[titleKey] ? EN[titleKey] : originals.title
    }
    document.querySelectorAll('.lang button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang))
    })
    try { localStorage.setItem('dm-site-lang', lang) } catch (e) { /* stockage indisponible */ }
  }
  document.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { applyLang(b.getAttribute('data-lang')) })
  })
  var saved = null
  try { saved = localStorage.getItem('dm-site-lang') } catch (e) { saved = null }
  var param = new URLSearchParams(location.search).get('lang')
  applyLang(param === 'en' || param === 'fr' ? param : saved === 'en' ? 'en' : 'fr')

  /* ------------------------------------------------------------------ menu, en-tête */
  var toggle = document.querySelector('.menu-toggle')
  var links = document.querySelector('.nav-links')
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open')
      toggle.setAttribute('aria-expanded', String(open))
    })
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) { links.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false') }
    })
  }
  var header = document.querySelector('.site-header')
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8) }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  /* ------------------------------------------------------------------ apparitions */
  var reveals = document.querySelectorAll('.reveal')
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target) }
      })
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
    reveals.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el) })
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible') })
  }
  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect()
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%')
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%')
    })
  })
  var year = document.querySelector('[data-year]')
  if (year) year.textContent = String(new Date().getFullYear())

  /* ------------------------------------------------------------------ graphique décoratif */
  var canvas = document.getElementById('hero-chart')
  if (!canvas) return
  var ctx = canvas.getContext('2d')
  var C = { up: '#04c86d', down: '#f03148', cyan: '#3fbcc5', violet: '#963fe7', grid: 'rgba(255,255,255,0.045)', text: '#b3bbcb' }

  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }

  // Scénario fictif : range, repli (liquidité sous des plus bas égaux), cassure de structure,
  // retour dans la zone d'ordres, poursuite. Chaque tirage reste DÉCORATIF.
  function scenario(seed) {
    var rand = rng(seed)
    var segments = [[9, 0.05], [10, -0.55], [6, 0.35], [5, -0.4], [15, 0.8], [6, -0.45], [11, 0.55]]
    var price = 100
    var candles = []
    var starts = []
    segments.forEach(function (seg) {
      starts.push(candles.length)
      for (var i = 0; i < seg[0]; i++) {
        var open = price
        var close = open + seg[1] + (rand() - 0.5) * 1.6
        var high = Math.max(open, close) + rand() * 0.9
        var low = Math.min(open, close) - rand() * 0.9
        candles.push({ o: open, h: high, l: low, c: close })
        price = close
      }
    })
    // Repères SMC calculés sur les bougies fictives.
    var swingIdx = 0
    for (var a = 0; a < starts[1]; a++) if (candles[a].h > candles[swingIdx].h) swingIdx = a
    var bos = -1
    for (var b = starts[4]; b < candles.length; b++) if (candles[b].c > candles[swingIdx].h) { bos = b; break }
    var ob = starts[4] - 1
    while (ob > 0 && candles[ob].c >= candles[ob].o) ob--
    var liqIdx = starts[1]
    for (var d = starts[1]; d < starts[4]; d++) if (candles[d].l < candles[liqIdx].l) liqIdx = d
    return { candles: candles, swing: swingIdx, bos: bos, ob: ob, liq: liqIdx }
  }

  var data = scenario(7)
  var shown = 0
  var overlay = 0
  var w = 0
  var h = 0
  var dpr = 1

  function resize() {
    var rect = canvas.getBoundingClientRect()
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    w = rect.width
    h = rect.height
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    draw()
  }

  function draw() {
    var top = 56
    var bottom = h - 28
    var left = 14
    var right = w - 18
    ctx.clearRect(0, 0, w, h)
    ctx.strokeStyle = C.grid
    ctx.lineWidth = 1
    for (var g = 0; g <= 5; g++) {
      var gy = top + ((bottom - top) * g) / 5
      ctx.beginPath(); ctx.moveTo(left, gy); ctx.lineTo(right, gy); ctx.stroke()
    }
    var all = data.candles
    var hi = -Infinity
    var lo = Infinity
    all.forEach(function (k) { hi = Math.max(hi, k.h); lo = Math.min(lo, k.l) })
    var pad = (hi - lo) * 0.08
    hi += pad; lo -= pad
    var step = (right - left) / all.length
    var body = Math.max(2, step * 0.6)
    function y(v) { return top + ((hi - v) / (hi - lo)) * (bottom - top) }
    function x(i) { return left + step * (i + 0.5) }

    // Zone d'ordres (violet) et lignes SMC, tracées progressivement.
    var visible = Math.floor(shown)
    if (overlay > 0 && data.ob >= 0) {
      var k = all[data.ob]
      var zx = x(data.ob) - step / 2
      var zw = (right - zx) * Math.min(1, overlay)
      ctx.fillStyle = 'rgba(150,63,231,0.16)'
      ctx.strokeStyle = 'rgba(150,63,231,0.55)'
      ctx.fillRect(zx, y(k.h), zw, y(k.l) - y(k.h))
      ctx.strokeRect(zx, y(k.h), zw, y(k.l) - y(k.h))
      label('OB', zx + 6, y(k.h) - 6, C.violet)
    }
    if (overlay > 0.25) {
      var sh = all[data.swing].h
      var end = data.bos >= 0 ? x(data.bos) : right
      var t = Math.min(1, (overlay - 0.25) / 0.5)
      dashed(x(data.swing), y(sh), x(data.swing) + (end - x(data.swing)) * t, y(sh), C.cyan, [6, 5])
      if (t >= 1) label('BOS', (x(data.swing) + end) / 2 - 12, y(sh) - 8, C.cyan)
    }
    if (overlay > 0.5) {
      var ll = all[data.liq].l
      var t2 = Math.min(1, (overlay - 0.5) / 0.5)
      dashed(x(data.liq) - step * 4, y(ll), x(data.liq) - step * 4 + (step * 10) * t2, y(ll), C.text, [2, 4])
      if (t2 >= 1) label('LIQ', x(data.liq) + step * 6.4, y(ll) + 4, C.text)
    }

    for (var i = 0; i < visible && i < all.length; i++) {
      var c = all[i]
      var color = c.c >= c.o ? C.up : C.down
      ctx.strokeStyle = color
      ctx.fillStyle = color
      ctx.beginPath(); ctx.moveTo(x(i), y(c.h)); ctx.lineTo(x(i), y(c.l)); ctx.stroke()
      var by = y(Math.max(c.o, c.c))
      ctx.fillRect(x(i) - body / 2, by, body, Math.max(1.5, y(Math.min(c.o, c.c)) - by))
    }
    // Ligne du dernier prix
    if (visible > 0) {
      var last = all[Math.min(visible, all.length) - 1]
      dashed(left, y(last.c), right, y(last.c), last.c >= last.o ? C.up : C.down, [2, 3])
    }
  }

  function dashed(x1, y1, x2, y2, color, dash) {
    ctx.save(); ctx.setLineDash(dash); ctx.strokeStyle = color; ctx.lineWidth = 1.25
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore()
  }
  function label(text, lx, ly, color) {
    ctx.save(); ctx.font = '600 11px Inter, system-ui, sans-serif'; ctx.fillStyle = color
    ctx.fillText(text, lx, ly); ctx.restore()
  }

  var running = false
  var last = 0
  var hold = 0
  var seed = 7
  function frame(now) {
    if (!running) return
    var dt = Math.min(64, now - (last || now))
    last = now
    if (shown < data.candles.length) shown += dt / 85
    else if (overlay < 1) overlay = Math.min(1, overlay + dt / 1800)
    else if ((hold += dt) > 4200) {
      seed += 1; data = scenario(seed); shown = 0; overlay = 0; hold = 0
    }
    draw()
    requestAnimationFrame(frame)
  }
  function start() { if (!running && !reduce) { running = true; last = 0; requestAnimationFrame(frame) } }
  function stop() { running = false }

  if (reduce) { shown = data.candles.length; overlay = 1 }
  resize()
  window.addEventListener('resize', resize)
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw)
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { e[0].isIntersecting ? start() : stop() }).observe(canvas)
  } else start()
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start() })
})()
