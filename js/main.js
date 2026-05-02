/* ============================================================
   Front Row Athlete Agency — Main JavaScript
   ============================================================ */

// === HERO SLIDESHOW ===
(function() {
  const slides = document.querySelectorAll('.hero-slide');
  const thumbs = document.querySelectorAll('.hero-thumb');
  const progressBar = document.getElementById('heroProgressBar');
  if (!slides.length) return;

  const INTERVAL = 5000; // 5s per slide
  let current = 0;
  let timer = null;
  let progressTimer = null;

  function goTo(index) {
    const prevIndex = current;
    const nextIndex = (index + slides.length) % slides.length;

    // 同じスライドへの遷移はスキップ（初期化時など）
    if (prevIndex === nextIndex) {
      current = nextIndex;
      return;
    }

    // 前スライドのビデオを停止
    const prevVideo = slides[prevIndex].querySelector('video');
    if (prevVideo) { prevVideo.pause(); prevVideo.currentTime = 0; }

    slides[prevIndex].classList.remove('active');
    thumbs[prevIndex] && thumbs[prevIndex].classList.remove('active');

    current = nextIndex;
    slides[current].classList.add('active');
    thumbs[current] && thumbs[current].classList.add('active');

    // 次スライドのビデオを再生
    const nextVideo = slides[current].querySelector('video');
    if (nextVideo) {
      nextVideo.muted = true;
      const p = nextVideo.play();
      if (p !== undefined) p.catch(() => {});
    }

    // Reset progress bar
    if (progressBar) {
      progressBar.style.transition = 'none';
      progressBar.style.width = '0%';
      // Force reflow
      progressBar.offsetWidth;
      progressBar.style.transition = `width ${INTERVAL}ms linear`;
      progressBar.style.width = '100%';
    }
  }

  function startAuto() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), INTERVAL);
  }

  // Expose globally for onclick handlers
  window.heroGoTo = function(index) {
    goTo(index);
    startAuto(); // reset timer on manual nav
  };

  // Init: iOSのmuted属性バグ対策でJS側でも全videoをmuted化してから再生
  slides.forEach(slide => {
    const v = slide.querySelector('video');
    if (v) { v.muted = true; v.setAttribute('muted', ''); }
  });

  const firstVideo = slides[0].querySelector('video');
  if (firstVideo) {
    const tryPlay = () => {
      firstVideo.muted = true;
      const p = firstVideo.play();
      if (p !== undefined) p.catch(() => {});
    };
    if (firstVideo.readyState >= 3) {
      tryPlay();
    } else {
      firstVideo.addEventListener('canplay', tryPlay, { once: true });
    }
  }
  // プログレスバー開始
  if (progressBar) {
    progressBar.style.transition = `width ${INTERVAL}ms linear`;
    progressBar.style.width = '100%';
  }
  startAuto();
})();

// === NAV SCROLL BEHAVIOR ===
const nav = document.querySelector('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// === ATHLETE CARD FILTER ===
const filterBtns = document.querySelectorAll('.filter-btn');
const athleteCards = document.querySelectorAll('.athlete-card[data-sport]');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const sport = btn.dataset.filter;

    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    athleteCards.forEach(card => {
      if (sport === 'all' || card.dataset.sport === sport) {
        card.style.display = '';
        card.style.animation = 'fadeIn 0.4s ease both';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// === COUNTER ANIMATION ===
const counters = document.querySelectorAll('[data-count]');

const animateCounter = (el) => {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 900;
  const start = performance.now();
  const isDecimal = el.dataset.decimal === 'true';

  const tick = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 4);
    const value = target * ease;

    el.textContent = prefix + (isDecimal ? value.toFixed(1) : Math.floor(value).toLocaleString()) + suffix;

    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = prefix + (isDecimal ? target.toFixed(1) : target.toLocaleString()) + suffix;
  };

  requestAnimationFrame(tick);
};

// Intersection observer for counters
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.animated) {
      entry.target.dataset.animated = 'true';
      animateCounter(entry.target);
    }
  });
}, { threshold: 0.3 });

counters.forEach(c => counterObserver.observe(c));

// === SMOOTH SCROLL ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// === FADE IN ON SCROLL ===
const fadeEls = document.querySelectorAll('.fade-in');
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

fadeEls.forEach(el => fadeObserver.observe(el));

// === MARQUEE DUPLICATE ===
const marqueeTrack = document.querySelector('.marquee-track');
if (marqueeTrack) {
  const clone = marqueeTrack.innerHTML;
  marqueeTrack.innerHTML += clone;
}

// === CONTACT TRACK SELECTION ===
const trackBtns = document.querySelectorAll('[data-track]');
const trackInput = document.getElementById('inquiry-type');

trackBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const track = btn.dataset.track;
    if (trackInput) {
      trackInput.value = track;
      // Scroll to form
      const form = document.getElementById('contact-form');
      if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    trackBtns.forEach(b => b.classList.remove('active-track'));
    btn.classList.add('active-track');
  });
});

// === LANGUAGE TOGGLE ===
const langBtns = document.querySelectorAll('.lang-toggle');
langBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const lang = btn.dataset.lang;
    document.querySelectorAll('[data-lang]').forEach(el => {
      el.style.display = el.dataset.lang === lang ? '' : 'none';
    });
    langBtns.forEach(b => b.classList.remove('active-lang'));
    btn.classList.add('active-lang');
  });
});

// === FORM SUBMISSION (Formspree) ===
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xdaybywo';

const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('.form-submit');
    btn.textContent = '送信中...';
    btn.disabled = true;

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(contactForm)
      });

      if (response.ok) {
        btn.textContent = '送信完了';
        btn.style.opacity = '0.6';
        const note = document.createElement('p');
        note.style.cssText = 'color: var(--white); font-size: 0.85rem; margin-top: 1rem; font-family: Fira Code, monospace;';
        note.textContent = '→ 48時間以内にご連絡いたします。';
        contactForm.appendChild(note);
      } else {
        throw new Error('送信に失敗しました');
      }
    } catch (err) {
      btn.textContent = 'エラーが発生しました。再度お試しください。';
      btn.disabled = false;
    }
  });
}

// === MOBILE MENU ===
const hamburger = document.getElementById('navHamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('.mobile-menu-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// === KEYBOARD NAV ===
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileMenu) {
    mobileMenu.classList.remove('open');
    hamburger && hamburger.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// CSS animation for fade-in
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-in {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }
  .fade-in.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .active-track::before { transform: scaleX(1) !important; }
`;
document.head.appendChild(style);
