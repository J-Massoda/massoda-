/* ============================================
   CREATIVE PORTFOLIO — creative.js
   ============================================ */

(function () {
  'use strict';

  /* ---- Slide data ---- */
  const SLIDES = [
    {
      bg: 'media/68bee35646a521957dd375c2_effect.jpg',
      preh1: 'Procreate Illustrations',
      h1: 'Bringing Characters to Life',
      btnText: 'View on Instagram',
      btnHref: 'https://www.instagram.com/fauxverse?igsh=bGNhYmxqZzVmeXVh',
      external: true
    },
    {
      bg: 'media/gallery/illustration-7.jpg',
      preh1: 'Fauxverse Studio',
      h1: 'Welcome to the Fauxverse',
      btnText: 'Watch on YouTube',
      btnHref: 'https://youtube.com/@fauxverse?si=PMcxbxpLp25F6SkK',
      external: true
    },
    {
      bg: 'media/gallery/jack-buddy-sketch.jpg',
      preh1: 'Animated Series',
      h1: 'Jack Buddy — Coming Soon',
      btnText: 'Read About It',
      btnHref: '#projects',
      external: false
    },
    {
      bg: 'media/68c0a8681a8d7423b4be6bd0_IMG-20250908-WA0010.jpg',
      preh1: 'Logo Animation & Branding',
      h1: 'Motion That Tells Your Story',
      btnText: 'See My Work',
      btnHref: 'https://www.instagram.com/fauxverse?igsh=bGNhYmxqZzVmeXVh',
      external: true
    }
  ];

  /* ============================================
     PAGE VEIL TRANSITION
     ============================================ */
  const veil = document.querySelector('.cp-veil');

  function veilFadeIn(cb) {
    if (!veil) { if (cb) cb(); return; }
    veil.classList.remove('hidden');
    veil.classList.add('visible');
    setTimeout(function () { if (cb) cb(); }, 520);
  }

  function veilFadeOut() {
    if (!veil) return;
    veil.classList.remove('visible');
    veil.classList.add('hidden');
  }

  /* Intercept all page-change links */
  function initPageLinks() {
    document.querySelectorAll('[data-page-link]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        var href = el.getAttribute('href');
        if (!href || href === '#' || href.charAt(0) === '#') return;
        e.preventDefault();
        veilFadeIn(function () {
          window.location.href = href;
        });
      });
    });
  }

  /* Fade out on load */
  window.addEventListener('load', function () {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        veilFadeOut();
      });
    });
  });

  /* ============================================
     HAMBURGER MENU
     ============================================ */
  function initMenu() {
    var hamburger = document.querySelector('.cp-hamburger');
    var menu = document.querySelector('.cp-menu');
    var overlay = document.querySelector('.cp-menu__overlay');
    if (!hamburger || !menu) return;

    hamburger.addEventListener('click', function () {
      var isOpen = menu.classList.contains('open');
      if (isOpen) closeMenu(); else openMenu();
    });

    if (overlay) {
      overlay.addEventListener('click', closeMenu);
    }

    /* Close menu when an anchor link is clicked */
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });

    /* Close on Escape */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  function openMenu() {
    var menu = document.querySelector('.cp-menu');
    if (!menu) return;
    menu.classList.add('open');
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    var menu = document.querySelector('.cp-menu');
    if (!menu) return;
    menu.classList.remove('open');
    document.body.classList.remove('menu-open');
  }

  /* ============================================
     HERO SLIDER
     ============================================ */
  var sliderInterval = null;
  var currentSlide = 0;
  var isAnimating = false;

  function buildHero() {
    var heroLeft = document.querySelector('.cp-hero-left');
    if (!heroLeft) return;

    /* Build slide elements */
    SLIDES.forEach(function (data, i) {
      var slide = document.createElement('div');
      slide.className = 'cp-slide' + (i === 0 ? ' is-active' : '');
      slide.innerHTML =
        '<div class="cp-slide__bg" style="background-image:url(\'' + data.bg + '\')"></div>' +
        '<div class="cp-slide__content">' +
          '<div class="cp-mask cp-slide__preh1-mask">' +
            '<span class="cp-mask-inner cp-slide__preh1">' + data.preh1 + '</span>' +
          '</div>' +
          '<div class="cp-mask cp-slide__h1-mask">' +
            '<h1 class="cp-mask-inner cp-slide__h1">' + data.h1 + '</h1>' +
          '</div>' +
          '<div class="cp-slide__btn-wrap">' +
            '<a href="' + data.btnHref + '"' +
              (data.external ? ' target="_blank" rel="noopener noreferrer"' : '') +
              ((!data.external && data.btnHref.indexOf('.html') === -1 && data.btnHref.charAt(0) !== '#') ? ' data-page-link' : '') +
              ' class="cp-btn">' +
              '<span class="cp-btn__icon"></span>' +
              '<span>' + data.btnText + '</span>' +
            '</a>' +
          '</div>' +
        '</div>';
      heroLeft.appendChild(slide);
    });

    /* Build mini-cards */
    var miniCardsArea = document.querySelector('.cp-mini-cards');
    if (miniCardsArea) {
      SLIDES.forEach(function (data, i) {
        var card = document.createElement('div');
        card.className = 'cp-mini-card' + (i === 0 ? ' is-active' : '');
        card.dataset.index = i;
        card.innerHTML =
          '<div class="cp-mini-card__bg" style="background-image:url(\'' + data.bg + '\')"></div>' +
          '<div class="cp-mini-card__gradient"></div>' +
          '<div class="cp-mini-card__content">' +
            '<div class="cp-mini-card__num">0' + (i + 1) + '</div>' +
            '<div class="cp-mini-card__title">' + data.preh1 + '. ' + data.h1 + '</div>' +
          '</div>';
        card.addEventListener('click', function () {
          goTo(i);
        });
        miniCardsArea.appendChild(card);
      });
    }

    /* Prev / Next buttons */
    var btnNext = document.querySelector('.cp-slider-nav__btn--next');
    var btnPrev = document.querySelector('.cp-slider-nav__btn--prev');
    if (btnNext) btnNext.addEventListener('click', function () { goTo((currentSlide + 1) % SLIDES.length); });
    if (btnPrev) btnPrev.addEventListener('click', function () { goTo((currentSlide - 1 + SLIDES.length) % SLIDES.length); });

    startAutoplay();
  }

  function goTo(index) {
    if (isAnimating || index === currentSlide) return;
    isAnimating = true;

    var slides = document.querySelectorAll('.cp-hero-left .cp-slide');
    var miniCards = document.querySelectorAll('.cp-mini-cards .cp-mini-card');

    slides[currentSlide].classList.remove('is-active');
    slides[currentSlide].classList.add('is-leaving');
    slides[index].classList.add('is-active');

    if (miniCards.length) {
      miniCards[currentSlide].classList.remove('is-active');
      miniCards[index].classList.add('is-active');
    }

    var leavingIndex = currentSlide;
    currentSlide = index;

    setTimeout(function () {
      slides[leavingIndex].classList.remove('is-leaving');
      isAnimating = false;
    }, 1800);

    resetAutoplay();
  }

  function startAutoplay() {
    sliderInterval = setInterval(function () {
      goTo((currentSlide + 1) % SLIDES.length);
    }, 4000);
  }

  function resetAutoplay() {
    clearInterval(sliderInterval);
    startAutoplay();
  }

  /* ============================================
     INTERSECTION OBSERVER — SCROLL REVEALS
     ============================================ */
  function initScrollReveals() {
    var targets = document.querySelectorAll(
      '.cp-date-row, .cp-dates-contacts, .cp-about-desc, .cp-video__char, ' +
      '.cp-video__desc, .cp-insta-photo, .cp-music__heading, .cp-music__text, ' +
      '.cp-be-in-touch__heading, .cp-be-in-touch__link, .cp-blog-article__title, ' +
      '.cp-blog-article__desc, .cp-blog-hero__h1, .cp-blog-featured__title, ' +
      '.cp-blog-featured__desc, .cp-artist-avatar, .cp-service-card, ' +
      '.cp-art-services__item, [data-reveal]'
    );

    if (!targets.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ============================================
     VIDEO CHARACTER STAGGER
     ============================================ */
  function initVideoChars() {
    var chars = document.querySelectorAll('.cp-video__char');
    if (!chars.length) return;

    var observer = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        chars.forEach(function (c, i) {
          setTimeout(function () { c.classList.add('in-view'); }, i * 60);
        });
        observer.disconnect();
      }
    }, { threshold: 0.2 });

    observer.observe(chars[0].closest('.cp-video') || chars[0]);
  }

  /* ============================================
     VIDEO LIGHTBOX
     ============================================ */
  function initVideoLightbox() {
    var trigger = document.querySelector('.cp-video-lightbox');
    var modal = document.querySelector('.cp-video-modal');
    var closeBtn = document.querySelector('.cp-video-modal__close');
    var iframe = document.querySelector('.cp-video-modal__inner iframe');
    if (!trigger || !modal) return;

    var videoSrc = trigger.dataset.videoSrc || '';

    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      if (iframe) iframe.src = videoSrc + '?autoplay=1';
      modal.classList.add('open');
      document.body.classList.add('menu-open');
    });

    function closeModal() {
      modal.classList.remove('open');
      document.body.classList.remove('menu-open');
      setTimeout(function () {
        if (iframe) iframe.src = '';
      }, 400);
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });
  }

  /* ============================================
     ACTIVE MENU LINK HIGHLIGHT
     ============================================ */
  function initActiveMenuLink() {
    var page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.cp-menu__link[href]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === page || (page === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  /* ============================================
     SMOOTH SCROLL FOR HASH LINKS
     ============================================ */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href').slice(1);
        if (!id) return;
        var target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        var wasOpen = document.querySelector('.cp-menu') && document.querySelector('.cp-menu').classList.contains('open');
        closeMenu();
        setTimeout(function () {
          target.scrollIntoView({ behavior: 'smooth' });
        }, wasOpen ? 600 : 0);
      });
    });
  }

  /* ============================================
     TIMELAPSE / SKETCHBOOK VIDEO LAZY-PLAY
     ============================================ */
  function initTimelapseVideos() {
    var videos = document.querySelectorAll('.cp-timelapse-card__video');
    if (!videos.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var video = entry.target;
        if (entry.isIntersecting) {
          if (!video.dataset.loaded) {
            var webm = video.dataset.srcWebm;
            var mp4 = video.dataset.srcMp4;
            if (webm) {
              var sWebm = document.createElement('source');
              sWebm.src = webm; sWebm.type = 'video/webm';
              video.appendChild(sWebm);
            }
            if (mp4) {
              var sMp4 = document.createElement('source');
              sMp4.src = mp4; sMp4.type = 'video/mp4';
              video.appendChild(sMp4);
            }
            video.load();
            video.dataset.loaded = 'true';
          }
          video.play().catch(function () {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.35 });

    videos.forEach(function (v) { observer.observe(v); });
  }

  /* ============================================
     CREATIVE CONTACT FORM — powered by formsubmit.co
     Delivers to both emilienmassoda@gmail.com and
     jeanemilien.massoda@gmail.com.
     ============================================ */
  function initContactForms() {
    var forms = qsa('.cp-contact-form');
    forms.forEach(function (form) {
      var successMsg = form.querySelector('.cp-contact-form__success');

      qsa('.cp-contact-form__input, .cp-contact-form__textarea', form).forEach(function (el) {
        el.addEventListener('input', function () {
          el.classList.remove('cp-contact-form__input--error', 'cp-contact-form__textarea--error');
        });
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var nameEl  = form.querySelector('[name="name"]');
        var emailEl = form.querySelector('[name="email"]');
        var msgEl   = form.querySelector('[name="message"]');
        var submitBtn = form.querySelector('.cp-contact-form__submit');

        var valid = true;
        [nameEl, emailEl, msgEl].forEach(function (el) {
          if (!el.value.trim()) {
            el.classList.add(el.tagName === 'TEXTAREA' ? 'cp-contact-form__textarea--error' : 'cp-contact-form__input--error');
            valid = false;
          }
        });
        if (!valid) return;

        var origText = submitBtn.textContent;
        submitBtn.textContent = 'Sending…';
        submitBtn.disabled = true;

        var serviceName = form.getAttribute('data-service') || 'Creative Portfolio';

        fetch('https://formsubmit.co/ajax/emilienmassoda@gmail.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            name: nameEl.value.trim(),
            email: emailEl.value.trim(),
            message: msgEl.value.trim(),
            _subject: serviceName + ' Enquiry from ' + nameEl.value.trim(),
            _replyto: emailEl.value.trim(),
            _cc: 'jeanemilien.massoda@gmail.com'
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
    });
  }

  /* ============================================
     NEWSLETTER SIGNUP — powered by formsubmit.co
     ============================================ */
  function initNewsletterForms() {
    var forms = qsa('.cp-newsletter__form');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var emailEl = form.querySelector('.cp-newsletter__input');
        if (!emailEl.value.trim()) return;
        var btn = form.querySelector('.cp-newsletter__btn');
        var origHTML = btn.innerHTML;

        fetch('https://formsubmit.co/ajax/emilienmassoda@gmail.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            email: emailEl.value.trim(),
            _subject: 'New Newsletter Signup'
          })
        })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.success === 'true' || data.success === true) {
            emailEl.value = '';
            btn.innerHTML = '&#10003;';
            setTimeout(function () { btn.innerHTML = origHTML; }, 2500);
          }
        })
        .catch(function () {});
      });
    });
  }

  /* ============================================
     INIT
     ============================================ */
  document.addEventListener('DOMContentLoaded', function () {
    initPageLinks();
    initMenu();
    buildHero();
    initScrollReveals();
    initVideoChars();
    initVideoLightbox();
    initTimelapseVideos();
    initContactForms();
    initNewsletterForms();
    initActiveMenuLink();
    initSmoothScroll();
  });

}());
