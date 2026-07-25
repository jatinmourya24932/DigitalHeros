
document.addEventListener('DOMContentLoaded', () => {
  initYear();
  initNavScroll();
  initMobileMenu();
  initSmoothScroll();
  initRevealAnimations();
  initCounters();
  initFaqAccordion();
  initContactForm();
  initRipple();
  initHeroGlow();
});

/* ---------- Cursor-following glow in the hero ---------- */
function initHeroGlow() {
  const hero = document.getElementById('top');
  const glow = document.getElementById('heroGlow');
  if (!hero || !glow) return;

  // Respect reduced-motion preference: skip the pointer-follow effect entirely.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  hero.addEventListener('pointermove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    glow.style.setProperty('--mx', `${x}%`);
    glow.style.setProperty('--my', `${y}%`);
  });
}

/* ---------- Footer year ---------- */
function initYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ---------- Navbar blur/shadow on scroll ---------- */
function initNavScroll() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const toggle = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  toggle();
  window.addEventListener('scroll', toggle, { passive: true });
}

/* ---------- Mobile hamburger menu ---------- */
function initMobileMenu() {
  const toggleBtn = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  const cta = document.querySelector('.nav__cta');
  if (!toggleBtn || !links) return;

  const closeMenu = () => {
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-label', 'Open menu');
    links.classList.remove('is-open');
    cta?.classList.remove('is-open');
  };

  toggleBtn.addEventListener('click', () => {
    const isOpen = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', String(!isOpen));
    toggleBtn.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
    links.classList.toggle('is-open', !isOpen);
    cta?.classList.toggle('is-open', !isOpen);
  });

  links.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMenu();
  });
}

/* ---------- Smooth scroll for in-page anchors ---------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ---------- Scroll-triggered reveal animations ---------- */
function initRevealAnimations() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const delay = (index % 3) * 90;
          setTimeout(() => entry.target.classList.add('is-visible'), delay);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach((el) => observer.observe(el));
}

/* ---------- Animated counters for the Results section ---------- */
function initCounters() {
  const stats = document.querySelectorAll('.stat__num[data-count-to]');
  if (!stats.length) return;

  const animateCount = (el) => {
    const target = parseFloat(el.dataset.countTo);
    const decimals = parseInt(el.dataset.decimal || '0', 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = target * eased;
      el.textContent = value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  if (!('IntersectionObserver' in window)) {
    stats.forEach(animateCount);
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  stats.forEach((el) => observer.observe(el));
}

/* ---------- FAQ accordion ---------- */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach((item) => {
    const btn = item.querySelector('.faq-item__q');
    const panel = item.querySelector('.faq-item__a');
    if (!btn || !panel) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all other items for a clean single-open accordion
      items.forEach((other) => {
        if (other === item) return;
        other.querySelector('.faq-item__q')?.setAttribute('aria-expanded', 'false');
        const otherPanel = other.querySelector('.faq-item__a');
        if (otherPanel) otherPanel.style.maxHeight = null;
      });

      btn.setAttribute('aria-expanded', String(!isOpen));
      panel.style.maxHeight = isOpen ? null : `${panel.scrollHeight}px`;
    });
  });
}

/* ---------- Contact form validation + no-refresh success ---------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const successMsg = document.getElementById('formSuccess');

  const validators = {
    name: (value) => value.trim().length >= 2 || 'Please enter your full name.',
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || 'Enter a valid email address.',
    phone: (value) => /^[+()\-.\s\d]{7,}$/.test(value.trim()) || 'Enter a valid phone number.',
    message: (value) => value.trim().length >= 10 || 'Message should be at least 10 characters.',
  };

  const validateField = (field) => {
    const wrapper = field.closest('.field');
    const errorEl = wrapper?.querySelector('.field__error');
    const validate = validators[field.name];
    if (!validate || !wrapper || !errorEl) return true;

    const result = validate(field.value);
    if (result === true) {
      wrapper.classList.remove('has-error');
      errorEl.textContent = '';
      return true;
    }
    wrapper.classList.add('has-error');
    errorEl.textContent = result;
    return false;
  };

  ['name', 'email', 'phone', 'message'].forEach((name) => {
    const field = form.elements.namedItem(name);
    if (field) field.addEventListener('blur', () => validateField(field));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const fields = ['name', 'email', 'phone', 'message'].map((name) => form.elements.namedItem(name));
    const allValid = fields.every((field) => field && validateField(field));

    if (!allValid) {
      fields.find((field) => field && !validateField(field))?.focus();
      return;
    }

    // Simulate a submission without a page refresh.
    if (successMsg) {
      successMsg.hidden = false;
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    form.reset();

    if (successMsg) {
      window.clearTimeout(initContactForm._hideTimer);
      initContactForm._hideTimer = window.setTimeout(() => {
        successMsg.hidden = true;
      }, 6000);
    }
  });
}

/* ---------- Ripple effect on primary buttons ---------- */
function initRipple() {
  const buttons = document.querySelectorAll('.btn--ripple');

  buttons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);

      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

      btn.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 650);
    });
  });
}
