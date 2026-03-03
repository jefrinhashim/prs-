// Hamburger menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

function openMobileMenu() {
  hamburger.classList.add('open');
  mobileMenu.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
}

if (hamburger) {
  hamburger.addEventListener('click', () => {
    if (hamburger.classList.contains('open')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });
}

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('in-view');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach((el) => revealObserver.observe(el));

// Nav scroll state
const nav = document.querySelector('nav');
const hero = document.querySelector('.hero');
const updateNavState = () => {
  const threshold = hero ? Math.max(hero.offsetHeight - 90, 40) : 40;
  const isPastHero = window.scrollY > threshold;
  nav.classList.toggle('scrolled', isPastHero);
};
window.addEventListener('scroll', updateNavState);
window.addEventListener('resize', updateNavState);
updateNavState();

// Page navigation
const navCfg = {
  dashboard: { links: ['#services', '#about', '#contact'], navLabel: null },
  allergies: { back: { label: '← Dashboard', page: 'dashboard' } },
  'trait-detail': { back: { label: '← Allergies', page: 'allergies' } },
  comparison: { back: { label: '← Dashboard', page: 'dashboard' } },
};

function showPage(id) {
  // hide all page-sections inside main-content
  document.querySelectorAll('.page-section').forEach((s) => s.classList.remove('active'));
  const target = document.getElementById('pg-' + id);
  if (!target) return;
  target.classList.add('active');

  // re-trigger reveal animations
  target.querySelectorAll('.reveal').forEach((el) => {
    el.classList.remove('in-view');
    setTimeout(() => revealObserver.observe(el), 30);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
  updateBackBtn(id);
}

function updateBackBtn(id) {
  const cfg = navCfg[id] || {};
  const btn = document.getElementById('back-btn');
  if (cfg.back && btn) {
    btn.style.display = 'inline-flex';
    btn.textContent = cfg.back.label;
    btn.onclick = () => showPage(cfg.back.page);
  } else if (btn) {
    btn.style.display = 'none';
  }
}

function initJumpMenu() {
  const items = document.querySelectorAll('.jump-menu-list li');
  if (!items.length) return;

  items.forEach((item) => {
    item.addEventListener('click', () => {
      items.forEach((li) => li.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

// Booking form feedback
const submitBtn = document.querySelector('.submit-btn');
if (submitBtn) {
  submitBtn.addEventListener('click', function () {
    this.textContent = '✓ Request Sent!';
    this.style.background = 'var(--accent)';
    setTimeout(() => {
      this.textContent = 'Request Appointment →';
      this.style.background = '';
    }, 3000);
  });
}

// Initialise
initJumpMenu();
showPage('dashboard');
