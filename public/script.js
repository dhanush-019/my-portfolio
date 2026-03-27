/* ═══════════════════════════════════════════════════════
   DHANUSH S — PORTFOLIO  |  script.js (UPDATED)
═══════════════════════════════════════════════════════ */

'use strict';

// ── SAFE SELECTORS ────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ── LOADER ─────────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    $('#loader')?.classList.add('hidden');
  }, 2000);
});

// ── CANVAS PARTICLES (SAFE) ───────────────────────────
const canvas = $('#bgCanvas');

if (canvas) {
  const ctx = canvas.getContext('2d');

  let particles = [];
  let w, h;

  function resizeCanvas() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  resizeCanvas();
  window.addEventListener('resize', () => {
    resizeCanvas();
    initParticles();
  });

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.size = Math.random() * 1.5 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.color = ['#a78bfa', '#22d3ee', '#f472b6'][Math.floor(Math.random() * 3)];
      this.life = Math.random() * 200 + 100;
      this.age = 0;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.age++;
      if (this.age > this.life) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function initParticles() {
    particles = Array.from({ length: 80 }, () => new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }

  initParticles();
  animate();
}

// ── CUSTOM CURSOR ─────────────────────────────────────
const cursorDot = $('.cursor-dot');
const cursorRing = $('.cursor-ring');

if (cursorDot && cursorRing) {
  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
  });

  function animateCursor() {
    ringX += (mouseX - ringX) * 0.1;
    ringY += (mouseY - ringY) * 0.1;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
}

// ── NAVBAR SCROLL ─────────────────────────────────────
const navbar = $('#navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// ── MOBILE MENU ───────────────────────────────────────
const hamburger = $('#hamburger');
const mobileMenu = $('#mobileMenu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
}

// ── TYPING EFFECT ─────────────────────────────────────
const typedEl = $('#typed');

if (typedEl) {
  const words = ['Web Developer', 'Full Stack Dev', 'Student'];
  let i = 0, j = 0, del = false;

  function type() {
    const word = words[i];

    typedEl.textContent = del
      ? word.slice(0, --j)
      : word.slice(0, ++j);

    if (!del && j === word.length) {
      del = true;
      return setTimeout(type, 1500);
    }

    if (del && j === 0) {
      del = false;
      i = (i + 1) % words.length;
    }

    setTimeout(type, del ? 50 : 100);
  }

  setTimeout(type, 1000);
}

// ── CONTACT FORM (MAIN FIX 🔥) ─────────────────────────
const form = $('#contactForm');
const success = $('#formSuccess');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = form.querySelector('button');
    const label = btn.querySelector('.btn-label');

    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const message = form.querySelector('[name="message"]').value.trim();

    if (!name || !email || !message) {
      alert('Fill all fields');
      return;
    }

    label.textContent = 'Sending...';
    btn.disabled = true;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });

      const result = await res.json();
      console.log(result);

      if (res.ok && result.success) {
        success.style.display = 'block';
        form.reset();
      } else {
        alert(result.error || 'Error sending message');
      }

    } catch (err) {
      console.error(err);
      alert('Server error');
    }

    setTimeout(() => {
      success.style.display = 'none';
    }, 4000);

    label.textContent = 'Send Message';
    btn.disabled = false;
  });
}

// ── SMOOTH SCROLL ─────────────────────────────────────
$$('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = $(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

console.log("🚀 Script Loaded");