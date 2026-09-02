/* ============================================
   MASSODA PORTFOLIO — main.js
   ============================================ */

(function () {
  'use strict';

  /* ---- Helpers ---- */
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  /* ============================================
     1. NAVBAR — scroll state & active link
     ============================================ */
  const navbar = qs('.navbar');

  if (navbar) {
    // Add scrolled class on scroll
    window.addEventListener('scroll', function () {
      if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });

    // Active nav link based on scroll position (home page only)
    const sections = qsa('section[id]');
    const navLinks = qsa('.navbar__link[data-section]');

    if (sections.length && navLinks.length) {
      const onScroll = function () {
        let current = '';
        const scrollY = window.scrollY + 120;

        sections.forEach(function (sec) {
          if (sec.offsetTop <= scrollY) {
            current = sec.id;
          }
        });

        navLinks.forEach(function (link) {
          link.classList.toggle('active', link.dataset.section === current);
        });
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }

  /* ============================================
     2. MOBILE MENU TOGGLE
     ============================================ */
  const hamburger = qs('.navbar__hamburger');
  const mobileMenu = qs('.navbar__mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      const isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close on link click
    qsa('a', mobileMenu).forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ============================================
     3. HIRE ME DROPDOWN
     ============================================ */
  const dropdown = qs('.navbar__dropdown');

  if (dropdown) {
    const toggle = qs('.navbar__dropdown-toggle', dropdown);
    const menu = qs('.navbar__dropdown-menu', dropdown);

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      dropdown.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(dropdown.classList.contains('open')));
    });

    // Close when clicking outside
    document.addEventListener('click', function (e) {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        dropdown.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ============================================
     4. SMOOTH SCROLL for anchor links
     ============================================ */
  document.addEventListener('click', function (e) {
    const anchor = e.target.closest('a[href]');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href) return;

    // Handle same-page anchors: href="#section"
    if (href.startsWith('#') && href.length > 1) {
      const target = document.getElementById(href.slice(1));
      if (target) {
        e.preventDefault();
        const navHeight = navbar ? navbar.offsetHeight : 80;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
      return;
    }

    // Handle cross-page anchors: href="/#section" — let browser handle it natively
    // (we only intercept if we're already on the home page)
    if (href.startsWith('/#')) {
      const isHomePage = window.location.pathname === '/' ||
        window.location.pathname.endsWith('index.html') ||
        window.location.pathname === '';

      if (isHomePage) {
        const sectionId = href.slice(2);
        const target = document.getElementById(sectionId);
        if (target) {
          e.preventDefault();
          const navHeight = navbar ? navbar.offsetHeight : 80;
          const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      }
      // else let the browser navigate to /#section normally
    }
  });

  /* ============================================
     5. FAQ ACCORDION
     ============================================ */
  const faqItems = qsa('.faq-item');

  faqItems.forEach(function (item) {
    const trigger = qs('.faq-item__trigger', item);
    if (!trigger) return;

    trigger.addEventListener('click', function () {
      const isOpen = item.classList.contains('open');

      // Close all others
      faqItems.forEach(function (other) {
        if (other !== item) other.classList.remove('open');
      });

      // Toggle this one
      item.classList.toggle('open', !isOpen);
    });
  });

  /* ============================================
     6. SCROLL-TRIGGERED FADE-IN
        Uses IntersectionObserver on .fade-in elements
     ============================================ */
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );

    qsa('.fade-in').forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show everything immediately
    qsa('.fade-in').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ============================================
     7. HASH ON LOAD — scroll to section if URL has hash
     ============================================ */
  if (window.location.hash) {
    const hash = window.location.hash.slice(1);
    const target = document.getElementById(hash);
    if (target) {
      setTimeout(function () {
        const navHeight = navbar ? navbar.offsetHeight : 80;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }, 200);
    }
  }

  /* ============================================
     8. HERO 3D TILT + TRANSLATION EFFECT
        Card rotates AND physically moves toward
        the cursor — matching the original Webflow
        ix2 magnetic behaviour.
     ============================================ */
  (function () {
    var heroBlock = qs('.home-hero-block');
    var tiltCard  = qs('.hero-rotate-image');
    var tiltBase  = qs('.hero-rotate-base');
    if (!heroBlock || !tiltCard || !tiltBase) return;
    if ('ontouchstart' in window) return;

    /* Rotation amplitude — how far it tilts (degrees) */
    var MAX_ROT   = 25;
    /* Translation amplitude — how far the card drifts (px) */
    var MAX_TX    = 40;
    var MAX_TY    = 30;

    var raf = null;

    /* targets set by mousemove */
    var tRX = 0, tRY = 0, tTX = 0, tTY = 0;
    /* current lerped values */
    var cRX = 0, cRY = 0, cTX = 0, cTY = 0;

    /* speed: lower = more lag / more "following" feel */
    var SPEED = 0.055;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function applyTransform() {
      /* rotation lives on .hero-rotate-image (perspective applied here) */
      tiltCard.style.transform =
        'perspective(900px)' +
        ' rotateX(' + cRX.toFixed(3) + 'deg)' +
        ' rotateY(' + cRY.toFixed(3) + 'deg)' +
        ' scale3d(1.05, 1.05, 1)';

      /* translation lives on .hero-rotate-base so the card drifts in 2D space */
      tiltBase.style.transform =
        'translate(calc(-50% + ' + cTX.toFixed(2) + 'px),' +
                   'calc(-50% + ' + cTY.toFixed(2) + 'px))';
    }

    function update() {
      cRX = lerp(cRX, tRX, SPEED);
      cRY = lerp(cRY, tRY, SPEED);
      cTX = lerp(cTX, tTX, SPEED);
      cTY = lerp(cTY, tTY, SPEED);
      applyTransform();
      raf = requestAnimationFrame(update);
    }

    heroBlock.addEventListener('mousemove', function (e) {
      var rect = heroBlock.getBoundingClientRect();
      /* normalise to -0.5 → +0.5 */
      var nx = (e.clientX - rect.left)  / rect.width  - 0.5;
      var ny = (e.clientY - rect.top)   / rect.height - 0.5;

      tRX = -ny * MAX_ROT;   /* tilt up/down */
      tRY =  nx * MAX_ROT;   /* tilt left/right */
      tTX =  nx * MAX_TX;    /* drift right when cursor is right */
      tTY =  ny * MAX_TY;    /* drift down when cursor is down */

      if (!raf) raf = requestAnimationFrame(update);
    });

    heroBlock.addEventListener('mouseleave', function () {
      /* ease everything back to zero */
      tRX = 0; tRY = 0; tTX = 0; tTY = 0;

      function easeBack() {
        cRX = lerp(cRX, 0, 0.09);
        cRY = lerp(cRY, 0, 0.09);
        cTX = lerp(cTX, 0, 0.09);
        cTY = lerp(cTY, 0, 0.09);
        applyTransform();
        var stillMoving =
          Math.abs(cRX) > 0.05 || Math.abs(cRY) > 0.05 ||
          Math.abs(cTX) > 0.1  || Math.abs(cTY) > 0.1;
        if (stillMoving) {
          raf = requestAnimationFrame(easeBack);
        } else {
          tiltCard.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
          tiltBase.style.transform = 'translate(-50%, -50%)';
          cancelAnimationFrame(raf);
          raf = null;
        }
      }
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(easeBack);
    });
  }());

  /* ============================================
     9. PROJECT ROW HOVER — CURSOR IMAGE PREVIEW
        A floating card with the project screenshot
        follows the cursor when hovering a project row.
        Uses lerp for a smooth lagging motion.
     ============================================ */
  (function () {
    var rows = qsa('.project-row[data-hover-image]');
    if (!rows.length) return;
    if ('ontouchstart' in window) return;

    // Preload every hover-preview image ahead of time so the first hover
    // shows it instantly instead of popping in after a network fetch.
    function preloadHoverImages() {
      rows.forEach(function (row) {
        var src = row.getAttribute('data-hover-image');
        if (!src) return;
        var img = new Image();
        img.src = src;
      });
    }
    if ('requestIdleCallback' in window) {
      requestIdleCallback(preloadHoverImages, { timeout: 2000 });
    } else {
      setTimeout(preloadHoverImages, 300);
    }

    // Build the floating preview element once
    var preview = document.createElement('div');
    preview.className = 'cursor-preview';
    preview.innerHTML = '<div class="cursor-preview__inner"><img class="cursor-preview__img" src="" alt="" /></div>';
    document.body.appendChild(preview);

    var previewImg = preview.querySelector('.cursor-preview__img');

    // Live mouse position (viewport coords)
    var mouseX = -400;
    var mouseY = -400;
    // Lerped (smoothed) position
    var lerpX  = -400;
    var lerpY  = -400;
    var rafId  = null;
    var active = false;

    // Pixel offsets from cursor so the card sits to the upper-right
    var OFFSET_X =  28;   // right of cursor
    var OFFSET_Y = -200;  // above cursor (card is ~240px tall)

    function lerp(a, b, t) { return a + (b - a) * t; }

    function tick() {
      lerpX = lerp(lerpX, mouseX, 0.09);
      lerpY = lerp(lerpY, mouseY, 0.09);
      preview.style.transform =
        'translate3d(' + (lerpX + OFFSET_X).toFixed(1) + 'px,' +
                         (lerpY + OFFSET_Y).toFixed(1) + 'px, 0)';
      rafId = requestAnimationFrame(tick);
    }

    // Track mouse anywhere on the page while active
    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    rows.forEach(function (row) {
      row.addEventListener('mouseenter', function () {
        var src = row.getAttribute('data-hover-image');
        if (previewImg.getAttribute('src') !== src) {
          previewImg.setAttribute('src', src);
        }
        // Snap lerp start to current position so it doesn't fly in from off-screen
        lerpX = mouseX;
        lerpY = mouseY;
        active = true;
        preview.classList.add('visible');
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(tick);
      });

      row.addEventListener('mouseleave', function () {
        active = false;
        preview.classList.remove('visible');
        cancelAnimationFrame(rafId);
        rafId = null;
      });
    });
  }());

  /* ============================================
     10. CONTACT FORM  — powered by formsubmit.co
         Delivers submissions to emilienmassoda@gmail.com.
         First submission sends an activation email to
         that address; click it once and all future
         messages arrive directly in the inbox.
     ============================================ */
  (function () {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var successMsg = document.getElementById('contact-success');

    // Clear error styling as the user types
    qsa('.contact__input', form).forEach(function (el) {
      el.addEventListener('input', function () {
        el.classList.remove('contact__input--error');
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameEl    = document.getElementById('cf-name');
      var emailEl   = document.getElementById('cf-email');
      var msgEl     = document.getElementById('cf-message');
      var submitBtn = form.querySelector('button[type="submit"]');

      // Client-side required-field validation
      var valid = true;
      [nameEl, emailEl, msgEl].forEach(function (el) {
        if (!el.value.trim()) {
          el.classList.add('contact__input--error');
          valid = false;
        }
      });
      if (!valid) return;

      var origText = submitBtn.textContent;
      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;

      fetch('https://formsubmit.co/ajax/hello@massoda.me', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name:     nameEl.value.trim(),
          email:    emailEl.value.trim(),
          message:  msgEl.value.trim(),
          _subject: 'Portfolio Enquiry from ' + nameEl.value.trim(),
          _cc: 'emilienmassoda@gmail.com',
          _replyto: emailEl.value.trim()
        })
      })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success === 'true' || data.success === true) {
          form.reset();
          submitBtn.textContent = 'Sent!';
          if (successMsg) successMsg.hidden = false;
        } else {
          throw new Error('submission failed');
        }
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = origText;
        alert('Something went wrong — please try again.');
      });
    });
  }());

})();
