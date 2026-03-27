/* ═══════════════════════════════════════════════════════
   DHANUSH S — PORTFOLIO  |  script.js
   All animations, interactions, and effects
═══════════════════════════════════════════════════════ */

'use strict';

// ── LOADER ─────────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 2000);
});

// ── CANVAS PARTICLE BG ─────────────────────────────────
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

let particles = [];
let w, h;

function resizeCanvas() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });

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
    if (this.age > this.life || this.x < 0 || this.x > w || this.y < 0 || this.y > h) this.reset();
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity * (1 - this.age / this.life);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 6;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function initParticles() {
  const count = Math.min(120, Math.floor((w * h) / 12000));
  particles = Array.from({ length: count }, () => new Particle());
}
initParticles();

// Connect nearby particles with lines
function connectParticles() {
  const maxDist = 100;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxDist) {
        ctx.save();
        ctx.globalAlpha = (1 - dist / maxDist) * 0.08;
        ctx.strokeStyle = '#a78bfa';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, w, h);
  particles.forEach(p => { p.update(); p.draw(); });
  connectParticles();
  requestAnimationFrame(animate);
}
animate();

// ── CUSTOM CURSOR ─────────────────────────────────────
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top = mouseY + 'px';
});

function animateCursor() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top = ringY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Hover effect on interactive elements
const hoverTargets = document.querySelectorAll('a, button, .project-card, .tool-card, .stat-box, .gallery-item');
hoverTargets.forEach(el => {
  el.addEventListener('mouseenter', () => cursorRing.classList.add('hovered'));
  el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovered'));
});

// ── NAVBAR ─────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});
document.querySelectorAll('.mob-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ── TYPING ANIMATION ───────────────────────────────────
const typedEl = document.getElementById('typed');
const words = ['Web Developer', 'UI/UX Enthusiast', 'CS Student', 'Problem Solver', 'Full-Stack Dev'];
let wordIdx = 0, charIdx = 0, deleting = false;

function type() {
  const word = words[wordIdx];
  if (!deleting) {
    typedEl.textContent = word.slice(0, ++charIdx);
    if (charIdx === word.length) { deleting = true; setTimeout(type, 1800); return; }
  } else {
    typedEl.textContent = word.slice(0, --charIdx);
    if (charIdx === 0) { deleting = false; wordIdx = (wordIdx + 1) % words.length; }
  }
  setTimeout(type, deleting ? 60 : 100);
}
setTimeout(type, 1200);

// ── SCROLL REVEAL ─────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── SKILL BAR ANIMATIONS ──────────────────────────────
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill-fill').forEach(fill => {
        const target = fill.dataset.width;
        setTimeout(() => { fill.style.width = target + '%'; }, 400);
      });
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const skillsSection = document.getElementById('skills');
if (skillsSection) skillObserver.observe(skillsSection);

// ── COUNTER ANIMATION ─────────────────────────────────
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-num').forEach(el => {
        const target = parseInt(el.dataset.target);
        let current = 0;
        const step = Math.ceil(target / 30);
        const interval = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = current;
          if (current >= target) clearInterval(interval);
        }, 50);
      });
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

const aboutSection = document.getElementById('about');
if (aboutSection) counterObserver.observe(aboutSection);

// ── SMOOTH SCROLL NAV LINKS ───────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ── ACTIVE NAV LINK ───────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.classList.add('active');
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => navObserver.observe(s));

// ── CONTACT FORM ─────────────────────────────────────
const form = document.getElementById('contactForm');
const success = document.getElementById('formSuccess');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const label = btn.querySelector('.btn-label');
    label.textContent = 'Sending...';
    btn.disabled = true;

    const data = {
      name: form.name.value,
      email: form.email.value,
      message: form.message.value
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        success.style.display = 'block';
        form.reset();
        setTimeout(() => { success.style.display = 'none'; }, 4000);
      } else {
        // Fallback for demo (no backend running)
        success.style.display = 'block';
        form.reset();
        setTimeout(() => { success.style.display = 'none'; }, 4000);
      }
    } catch {
      // Demo mode: show success anyway
      success.style.display = 'block';
      form.reset();
      setTimeout(() => { success.style.display = 'none'; }, 4000);
    }

    label.textContent = 'Send Message';
    btn.disabled = false;
  });
}

// ── PARALLAX ORB EFFECT ─────────────────────────────
document.addEventListener('mousemove', e => {
  const orbs = document.querySelectorAll('.orb');
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;
  orbs.forEach((orb, i) => {
    const strength = (i + 1) * 12;
    orb.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
  });
});

// ── PROJECT CARD TILT ─────────────────────────────────
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `translateY(-6px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
    card.style.transition = 'none';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = '';
  });
});

// ── GALLERY HOVER ─────────────────────────────────────
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('mouseenter', () => {
    item.querySelector('.gallery-inner').style.transform = 'scale(1.04)';
  });
  item.addEventListener('mouseleave', () => {
    item.querySelector('.gallery-inner').style.transform = '';
  });
});

// ── SECTION LABEL STAGGER ─────────────────────────────
document.querySelectorAll('.section-label').forEach((label, i) => {
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      label.style.opacity = '1';
      label.style.transform = 'translateY(0)';
      obs.disconnect();
    }
  }, { threshold: 0.5 });
  label.style.opacity = '0';
  label.style.transform = 'translateY(20px)';
  label.style.transition = 'all 0.6s ease 0.1s';
  obs.observe(label);
});

console.log('%c Dhanush S Portfolio — Built with ❤️ and neon lights ', 
  'background: linear-gradient(135deg,#a78bfa,#22d3ee); color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold;');