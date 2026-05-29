/* =========================================================
   Smart Merch Design — shared.js
   All animations in one clean IIFE, no scope conflicts
   ========================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. PAGE LOAD FADE-IN ── */
  document.documentElement.style.opacity = '0';
  window.addEventListener('load', function () {
    document.documentElement.style.transition = 'opacity 0.5s ease';
    document.documentElement.style.opacity = '1';
  });

  /* ── 2. ELEMENTS WE NEED ── */
  var nav     = document.querySelector('nav');
  var hero    = document.querySelector('.page-hero');
  var bar     = document.createElement('div');
  var topBtn  = document.createElement('button');
  var glow    = null;

  // Scroll progress bar
  bar.id = 'scroll-progress';
  document.body.prepend(bar);

  // Scroll-to-top button
  topBtn.id = 'scroll-top';
  topBtn.setAttribute('aria-label', 'Back to top');
  topBtn.innerHTML = '&#8679;';
  document.body.appendChild(topBtn);
  topBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── 3. UNIFIED SCROLL HANDLER ── */
  function onScroll() {
    var sy    = window.scrollY;
    var total = document.documentElement.scrollHeight - window.innerHeight;

    // Nav shadow
    if (nav) nav.classList.toggle('nav-scrolled', sy > 50);

    // Hero parallax dot grid
    if (hero) hero.style.setProperty('--px', (sy * 0.22) + 'px');

    // Progress bar
    bar.style.width = (total > 0 ? (sy / total * 100) : 0) + '%';

    // Scroll-to-top button
    topBtn.classList.toggle('visible', sy > 500);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── 4. CURSOR GLOW (desktop only) ── */
  if (!reduced && window.matchMedia('(pointer: fine)').matches) {
    glow = document.createElement('div');
    glow.id = 'cursor-glow';
    document.body.appendChild(glow);
    var glowVisible = false;
    document.addEventListener('mousemove', function (e) {
      glow.style.left = e.clientX + 'px';
      glow.style.top  = e.clientY + 'px';
      if (!glowVisible) { glow.style.opacity = '1'; glowVisible = true; }
    });
    document.addEventListener('mouseleave', function () {
      glow.style.opacity = '0'; glowVisible = false;
    });
  }

  /* ── 5. CLICK RIPPLE ── */
  if (!reduced) {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest(
        '.form-submit,.etsy-btn,.btn-next,.hero-etsy,.price-cta,.tier-cta,.hero-cta'
      );
      if (!btn) return;
      var r      = btn.getBoundingClientRect();
      var size   = Math.max(r.width, r.height);
      var ripple = document.createElement('span');
      ripple.className = 'ripple-ring';
      ripple.style.cssText =
        'width:' + size + 'px;height:' + size + 'px;' +
        'left:' + (e.clientX - r.left - size / 2) + 'px;' +
        'top:'  + (e.clientY - r.top  - size / 2) + 'px;';
      btn.style.position = btn.style.position || 'relative';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', function () { ripple.remove(); });
    });
  }

  /* ── 6. SCROLL REVEAL WITH STAGGER ── */
  var REVEAL_SELECTORS = [
    '.svc-card','.value-card','.price-card','.tc',
    '.port-card','.team-card','.addon-card','.method-card',
    '.si-card','.tier-card','.faq-item','.stat-box',
    '.brand-pill','.proc-step','.step-full',
    '.guarantee','.timeline-vis',
    '.story-text','.story-visual',
    '.mission-strip blockquote',
    '.sec-title','.sec-tag','.tl-day',
    '.why-card','.ccard','.contact-card','.rbar','.etsy-cta'
  ];

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  var seen = new Set();
  REVEAL_SELECTORS.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      if (seen.has(el)) return;
      seen.add(el);
      var parent = el.parentElement;
      if (parent) {
        var siblings = Array.from(parent.children).filter(function (c) {
          return c.matches && c.matches(sel);
        });
        var idx = siblings.indexOf(el);
        if (idx > 0) el.style.setProperty('--reveal-delay', Math.min(idx * 0.09, 0.45) + 's');
      }
      el.classList.add('reveal');
      revealObserver.observe(el);
    });
  });

  /* ── 7. COUNTER ANIMATION ── */
  function animateCounter(el) {
    var text  = el.textContent.trim();
    if (text.includes('∞')) return;
    var match = text.match(/^(\$?)(\d+(?:\.\d+)?)(.*)/);
    if (!match) return;
    var prefix   = match[1];
    var target   = parseFloat(match[2]);
    var suffix   = match[3];
    var isFloat  = match[2].includes('.');
    var decimals = isFloat ? (match[2].split('.')[1] || '').length : 0;
    var duration = 1800;
    var startTime = null;
    function tick(now) {
      if (!startTime) startTime = now;
      var t     = Math.min((now - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      var val   = target * eased;
      el.textContent = prefix + (isFloat ? val.toFixed(decimals) : Math.round(val).toLocaleString()) + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + (isFloat ? target.toFixed(decimals) : target.toLocaleString()) + suffix;
    }
    requestAnimationFrame(tick);
  }

  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  /* ── 8. RATING BAR FILL ── */
  var barObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var fill   = entry.target;
        var target = fill.style.width;
        fill.style.width = '0%';
        fill.style.transition = 'none';
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            fill.style.transition = 'width 1.3s cubic-bezier(.22,1,.36,1)';
            fill.style.width = target;
          });
        });
        barObserver.unobserve(fill);
      }
    });
  }, { threshold: 0.5 });

  /* ── 9. 3D CARD TILT ── */
  if (!reduced && window.matchMedia('(pointer: fine)').matches) {
    var TILT = '.svc-card,.value-card,.price-card,.port-card,.team-card,.tier-card,.tc,.si-card';
    document.querySelectorAll(TILT).forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width  - 0.5;
        var y = (e.clientY - r.top)  / r.height - 0.5;
        el.style.transform = 'perspective(700px) rotateX(' + (-y * 8) + 'deg) rotateY(' + (x * 8) + 'deg) scale(1.02)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transition = 'transform .5s cubic-bezier(.22,1,.36,1)';
        el.style.transform  = '';
        setTimeout(function () { el.style.transition = ''; }, 500);
      });
    });
  }

  /* ── 10. MAGNETIC BUTTONS ── */
  if (!reduced && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.form-submit,.etsy-btn,.hero-etsy').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width  / 2) * 0.14;
        var y = (e.clientY - r.top  - r.height / 2) * 0.14;
        btn.style.transform = 'translate(' + x + 'px,' + y + 'px) translateY(-2px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  /* ── 11. TYPED TEXT (homepage hero) ── */
  var typedEl = document.querySelector('.hero-tag-typed');
  if (typedEl) {
    var words = ['Custom Merch', 'Bulk Orders', 'Rush Production', 'Smart Design'];
    var wi = 0, ci = 0, deleting = false;
    function type() {
      var word = words[wi];
      if (!deleting) {
        typedEl.textContent = word.slice(0, ++ci);
        if (ci === word.length) { deleting = true; setTimeout(type, 1800); return; }
      } else {
        typedEl.textContent = word.slice(0, --ci);
        if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; }
      }
      setTimeout(type, deleting ? 55 : 95);
    }
    setTimeout(type, 800);
  }

  /* ── 12. MOUSE PARALLAX ON HOMEPAGE HERO ── */
  var homeHero   = document.querySelector('.hero');
  if (homeHero && !reduced) {
    var heroLeft  = homeHero.querySelector('.hero-left');
    var heroRight = homeHero.querySelector('.hero-right');
    homeHero.addEventListener('mousemove', function (e) {
      var r = homeHero.getBoundingClientRect();
      var x = (e.clientX - r.left - r.width  / 2) / r.width;
      var y = (e.clientY - r.top  - r.height / 2) / r.height;
      if (heroLeft)  heroLeft.style.transform  = 'translate(' + (x * 10)  + 'px,' + (y * 6)  + 'px)';
      if (heroRight) heroRight.style.transform = 'translate(' + (x * -14) + 'px,' + (y * -8) + 'px)';
    });
    homeHero.addEventListener('mouseleave', function () {
      [heroLeft, heroRight].forEach(function (el) {
        if (!el) return;
        el.style.transition = 'transform .8s ease';
        el.style.transform  = '';
        setTimeout(function () { el.style.transition = ''; }, 800);
      });
    });
  }

  /* ── 13. GLITCH FLASH ON "MERCH" ── */
  if (!reduced) {
    var logoEm = document.querySelector('.logo em');
    if (logoEm) {
      function triggerGlitch() {
        logoEm.classList.add('glitch-active');
        logoEm.addEventListener('animationend', function () {
          logoEm.classList.remove('glitch-active');
        }, { once: true });
        setTimeout(triggerGlitch, 6000 + Math.random() * 8000);
      }
      setTimeout(triggerGlitch, 3000 + Math.random() * 4000);
    }
  }

  /* ── 14. SMOOTH ANCHOR LINKS ── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  /* ── INIT ── */
  function init() {
    document.querySelectorAll('.stat-box .n, .stat-num, .score-num').forEach(function (el) {
      counterObserver.observe(el);
    });
    document.querySelectorAll('.rbar-fill').forEach(function (el) {
      barObserver.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
