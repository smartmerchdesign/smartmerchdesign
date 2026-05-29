(function () {
  'use strict';

  /* ══════════════════════════════════════════════
     1. PAGE LOAD FADE-IN
  ══════════════════════════════════════════════ */
  document.documentElement.style.opacity = '0';
  window.addEventListener('load', function () {
    document.documentElement.style.transition = 'opacity 0.5s ease';
    document.documentElement.style.opacity = '1';
  });

  /* ══════════════════════════════════════════════
     2. NAV SHADOW ON SCROLL
  ══════════════════════════════════════════════ */
  var nav = document.querySelector('nav');
  var hero = document.querySelector('.page-hero');
  var topBtn;
  function onScroll() {
    var sy = window.scrollY;
    var total = document.documentElement.scrollHeight - window.innerHeight;
    if (nav) nav.classList.toggle('nav-scrolled', sy > 50);
    if (hero) hero.style.setProperty('--px', (sy * 0.22) + 'px');
    if (bar) bar.style.width = (total > 0 ? (sy / total * 100) : 0) + '%';
    if (topBtn) topBtn.classList.toggle('visible', sy > 500);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ══════════════════════════════════════════════
     4. SCROLL REVEAL WITH STAGGER
  ══════════════════════════════════════════════ */
  var SELECTORS = [
    '.svc-card', '.value-card', '.price-card', '.tc',
    '.port-card', '.team-card', '.addon-card', '.method-card',
    '.si-card', '.tier-card', '.faq-item', '.stat-box',
    '.brand-pill', '.proc-step', '.step-full',
    '.guarantee', '.timeline-vis',
    '.story-text', '.story-visual',
    '.mission-strip blockquote',
    '.sec-title', '.sec-tag',
    '.tl-day', '.value-card', '.team-card',
    '.why-card', '.step', '.ccard', '.contact-card',
    '.rbar', '.etsy-cta', '.port-card'
  ];

  function initReveal() {
    var seen = new Set();

    SELECTORS.forEach(function (sel) {
      var els = document.querySelectorAll(sel);
      els.forEach(function (el) {
        if (seen.has(el)) return;
        seen.add(el);

        // Stagger siblings inside same parent
        var parent = el.parentElement;
        if (parent) {
          var siblings = Array.from(parent.children).filter(function (c) {
            return c.matches && c.matches(sel);
          });
          var idx = siblings.indexOf(el);
          if (idx > 0) {
            el.style.setProperty('--reveal-delay', Math.min(idx * 0.09, 0.45) + 's');
          }
        }

        el.classList.add('reveal');
        revealObserver.observe(el);
      });
    });
  }

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  /* ══════════════════════════════════════════════
     5. COUNTER ANIMATION
  ══════════════════════════════════════════════ */
  function animateCounter(el) {
    var text = el.textContent.trim();
    if (text.includes('∞')) return;

    var match = text.match(/^(\$?)(\d+(?:\.\d+)?)(.*)/);
    if (!match) return;

    var prefix  = match[1];
    var target  = parseFloat(match[2]);
    var suffix  = match[3];
    var isFloat = match[2].includes('.');
    var decimals = isFloat ? (match[2].split('.')[1] || '').length : 0;
    var duration = 1800;
    var startTime = null;

    function tick(now) {
      if (!startTime) startTime = now;
      var elapsed  = now - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased    = 1 - Math.pow(1 - progress, 3);
      var current  = target * eased;

      el.textContent = prefix +
        (isFloat ? current.toFixed(decimals) : Math.round(current).toLocaleString()) +
        suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = prefix +
          (isFloat ? target.toFixed(decimals) : target.toLocaleString()) +
          suffix;
      }
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

  /* ══════════════════════════════════════════════
     6. RATING BAR FILL ANIMATION
  ══════════════════════════════════════════════ */
  var barObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var fill = entry.target;
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

  /* ══════════════════════════════════════════════
     7. MAGNETIC BUTTONS
  ══════════════════════════════════════════════ */
  function initMagnetic() {
    document.querySelectorAll('.form-submit, .etsy-btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.14;
        var y = (e.clientY - r.top - r.height / 2) * 0.14;
        btn.style.transform = 'translate(' + x + 'px, ' + y + 'px) translateY(-2px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  /* ══════════════════════════════════════════════
     8. TYPED CURSOR ON HOMEPAGE HERO (index only)
  ══════════════════════════════════════════════ */
  function initTyped() {
    var tag = document.querySelector('.hero-tag-typed');
    if (!tag) return;
    var words = ['Custom Merch', 'Bulk Orders', 'Rush Production', 'Smart Design'];
    var wi = 0, ci = 0, deleting = false;

    function type() {
      var word = words[wi];
      if (!deleting) {
        tag.textContent = word.slice(0, ++ci);
        if (ci === word.length) {
          deleting = true;
          setTimeout(type, 1800);
          return;
        }
      } else {
        tag.textContent = word.slice(0, --ci);
        if (ci === 0) {
          deleting = false;
          wi = (wi + 1) % words.length;
        }
      }
      setTimeout(type, deleting ? 55 : 95);
    }
    setTimeout(type, 800);
  }

  /* ══════════════════════════════════════════════
     9. SMOOTH ANCHOR LINKS
  ══════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ══════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════ */
  function init() {
    initReveal();
    initMagnetic();
    initTyped();

    // Counter targets
    document.querySelectorAll('.stat-box .n, .stat-num, .score-num').forEach(function (el) {
      counterObserver.observe(el);
    });

    // Rating bars
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

/* ═══════════════════════════════════════════════════
   EXTRA ANIMATIONS v2
   ═══════════════════════════════════════════════════ */
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. SCROLL PROGRESS BAR ── */
  var bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.prepend(bar);

  function updateProgress() {
    var scrolled = window.scrollY;
    var total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
  }
  // progress updated in unified onScroll

  /* ── 2. CURSOR GLOW (desktop only) ── */
  if (!reduced && window.matchMedia('(pointer: fine)').matches) {
    var glow = document.createElement('div');
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

  /* ── 3. CLICK RIPPLE ON BUTTONS ── */
  if (!reduced) {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.form-submit, .etsy-btn, .btn-next, .hero-etsy, .price-cta, .tier-cta');
      if (!btn) return;
      var r = btn.getBoundingClientRect();
      var size = Math.max(r.width, r.height);
      var ripple = document.createElement('span');
      ripple.className = 'ripple-ring';
      ripple.style.cssText =
        'width:' + size + 'px;height:' + size + 'px;' +
        'left:' + (e.clientX - r.left - size / 2) + 'px;' +
        'top:'  + (e.clientY - r.top  - size / 2) + 'px;';
      btn.style.position = btn.style.position || 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', function () { ripple.remove(); });
    });
  }

  /* ── 4. 3D CARD TILT ── */
  if (!reduced && window.matchMedia('(pointer: fine)').matches) {
    var TILT_SELECTORS =
      '.svc-card,.value-card,.price-card,.port-card,.team-card,.tier-card,.tc,.si-card';

    function addTilt(el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width  - 0.5;
        var y = (e.clientY - r.top)  / r.height - 0.5;
        el.style.transform =
          'perspective(700px) rotateX(' + (-y * 8) + 'deg) rotateY(' + (x * 8) + 'deg) scale(1.02)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transition = 'transform .5s cubic-bezier(.22,1,.36,1)';
        el.style.transform  = '';
        setTimeout(function () { el.style.transition = ''; }, 500);
      });
    }

    document.querySelectorAll(TILT_SELECTORS).forEach(addTilt);
  }

  /* ── 5. SCROLL-TO-TOP BUTTON ── */
  topBtn = document.createElement('button');
  topBtn.id = 'scroll-top';
  topBtn.setAttribute('aria-label', 'Back to top');
  topBtn.innerHTML = '&#8679;';
  document.body.appendChild(topBtn);

  // scroll-top updated in unified onScroll

  topBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── 6. MOUSE PARALLAX ON HOMEPAGE HERO ── MOUSE PARALLAX ON HOMEPAGE HERO ── */
  var heroSection = document.querySelector('.hero');
  if (heroSection && !reduced) {
    var heroLeft  = heroSection.querySelector('.hero-left');
    var heroRight = heroSection.querySelector('.hero-right');

    heroSection.addEventListener('mousemove', function (e) {
      var r = heroSection.getBoundingClientRect();
      var x = (e.clientX - r.left - r.width  / 2) / r.width;
      var y = (e.clientY - r.top  - r.height / 2) / r.height;
      if (heroLeft)  heroLeft.style.transform  = 'translate(' + (x * 10) + 'px,' + (y * 6) + 'px)';
      if (heroRight) heroRight.style.transform = 'translate(' + (x * -14) + 'px,' + (y * -8) + 'px)';
    });
    heroSection.addEventListener('mouseleave', function () {
      if (heroLeft)  { heroLeft.style.transition  = 'transform .8s ease'; heroLeft.style.transform  = ''; }
      if (heroRight) { heroRight.style.transition = 'transform .8s ease'; heroRight.style.transform = ''; }
      setTimeout(function () {
        if (heroLeft)  heroLeft.style.transition  = '';
        if (heroRight) heroRight.style.transition = '';
      }, 800);
    });
  }

  /* ── 8. GLITCH FLASH ON NAV LOGO ── */
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

})();
