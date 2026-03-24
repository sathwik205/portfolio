/* ═══════════════════════════════════════════
   Anti-Gravity Portfolio — script.js
   AI Command Center Edition
═══════════════════════════════════════════ */

/* ── PARTICLE ENGINE ── */
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resize();
window.addEventListener('resize', () => { resize(); initParticles(); });

class Particle {
    constructor() { this.reset(true); }
    reset(rand = false) {
        this.x = rand ? Math.random() * canvas.width : (Math.random() > .5 ? 0 : canvas.width);
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.3;
        this.speedX = (Math.random() - .5) * .3;
        this.speedY = (Math.random() - .5) * .3;
        this.opacity = Math.random() * .5 + .1;
        this.color = ['0,242,255','188,19,254','255,140,0'][Math.floor(Math.random()*3)];
    }
    update() {
        this.x += this.speedX; this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color},${this.opacity})`;
        ctx.shadowBlur = 8; ctx.shadowColor = `rgba(${this.color},.7)`;
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const n = Math.min(Math.floor((canvas.width * canvas.height) / 8500), 180);
    for (let i = 0; i < n; i++) particles.push(new Particle());
}
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
}
initParticles();
animateParticles();

/* ── PARALLAX ── */
let mx = 0, my = 0;
document.addEventListener('mousemove', e => { mx = (e.clientX / window.innerWidth - .5) * 2; my = (e.clientY / window.innerHeight - .5) * 2; });
(function loop() {
    const hc = document.querySelector('.hero-content');
    const hp = document.querySelector('.holographic-profile');
    if (hc) hc.style.transform = `translate(${mx * 6}px, ${my * 6}px)`;
    if (hp) hp.style.transform = `translate(${mx * -9}px, ${my * -9}px)`;
    requestAnimationFrame(loop);
})();

/* ── NAV ── */
const navbar = document.getElementById('navbar');
const navLinks = document.getElementById('nav-links');
const hamburger = document.getElementById('hamburger');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
    const sections = document.querySelectorAll('section[id]');
    let cur = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) cur = s.id; });
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${cur}`));
});

hamburger.addEventListener('click', () => { navLinks.classList.toggle('open'); hamburger.classList.toggle('active'); });
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { navLinks.classList.remove('open'); hamburger.classList.remove('active'); }));

/* ── SCROLL REVEAL ── */
const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: .1, rootMargin: '0px 0px -40px 0px' });
function observeReveals() { document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el)); }

/* ── VANILLA TILT ── */
function initTilt() {
    if (typeof VanillaTilt === 'undefined') return;
    VanillaTilt.init(document.querySelectorAll('[data-tilt]'), { max: 10, speed: 400, glare: false });
}
initTilt();

/* ══════════════════════════════════
   TYPED TEXT ANIMATION
══════════════════════════════════ */
function startTyped(roles) {
    const el = document.getElementById('typed-text');
    let ri = 0, ci = 0, deleting = false, pause = 0;
    function tick() {
        const word = roles[ri];
        if (pause > 0) { pause--; setTimeout(tick, 80); return; }
        if (!deleting) {
            el.textContent = word.slice(0, ++ci);
            if (ci === word.length) { pause = 22; deleting = true; }
        } else {
            el.textContent = word.slice(0, --ci);
            if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; pause = 5; }
        }
        setTimeout(tick, deleting ? 55 : 90);
    }
    tick();
}

/* ══════════════════════════════════
   DATA-DRIVEN RENDERING
══════════════════════════════════ */
async function loadData() {
    try {
        const res = await fetch('data.json');
        const data = await res.json();
        renderHero(data.profile);
        renderEducation(data.education);
        renderSkillMatrix(data.skills);
        renderProjects(data.projects);
        renderAchievements(data.achievements);
        renderContactLinks(data.profile);
        observeReveals();
        initTilt();
        startTyped(data.profile.typedRoles || ['AI/ML Engineer', 'Machine Learning Enthusiast', 'Problem Solver']);
    } catch (err) {
        console.warn('data.json not loaded:', err);
        startTyped(['AI/ML Engineer', 'Machine Learning Enthusiast', 'Problem Solver']);
    }
}

/* Hero */
function renderHero(p) {
    document.getElementById('hero-tagline').textContent = `"${p.tagline}"`;
    document.getElementById('bio-location').textContent = p.location;
    document.getElementById('hero-meta').innerHTML = `
        <a href="${p.links.github}" target="_blank" rel="noopener"><i class="fab fa-github"></i> GitHub</a>
        <a href="${p.links.linkedin}" target="_blank" rel="noopener"><i class="fab fa-linkedin"></i> LinkedIn</a>
        <a href="mailto:${p.email}"><i class="fas fa-envelope"></i> ${p.email}</a>`;
}

/* Education satellites */
function renderEducation(edu) {
    const orbit = document.getElementById('edu-orbit');
    orbit.querySelectorAll('.edu-satellite').forEach(el => el.remove());
    const positions = ['sat-0','sat-1','sat-2'];
    edu.forEach((e, i) => {
        const div = document.createElement('div');
        div.className = `edu-satellite ${positions[i]||''} glass-panel reveal d${i+1}`;
        div.style.cssText = `border-color:${e.color}44;box-shadow:0 0 16px ${e.color}1a;`;
        div.innerHTML = `
            <i class="fas fa-university" style="color:${e.color}"></i>
            <h4>${e.institution}</h4>
            <p>${e.degree}</p>
            <span class="edu-dur">${e.duration}</span>`;
        if (e.specialization) div.querySelector('.edu-dur').insertAdjacentHTML('beforebegin', `<span class="edu-badge" style="color:${e.color};border:1px solid ${e.color}55;background:${e.color}18">${e.specialization}</span>`);
        orbit.appendChild(div);
    });
}

/* Professional Skill Matrix */
const skillConfig = [
    { key:'languages', label:'Languages',         icon:'fas fa-code',      cls:'',        tags: d => d.languages },
    { key:'aiml',      label:'AI/ML Frameworks',  icon:'fas fa-brain',     cls:'g-purple', tags: d => d.aiml },
    { key:'core',      label:'Core Logic',         icon:'fas fa-microchip', cls:'g-blue',  tags: d => d.core },
    { key:'tools',     label:'Data Tools',         icon:'fas fa-tools',     cls:'g-orange', tags: d => d.tools }
];

function renderSkillMatrix(skills) {
    const grid = document.getElementById('skill-matrix');
    grid.innerHTML = '';
    skillConfig.forEach((cfg, i) => {
        const tags = cfg.tags(skills) || [];
        const el = document.createElement('div');
        el.className = `skill-group ${cfg.cls} reveal d${i+1}`;
        el.setAttribute('data-tilt',''); el.setAttribute('data-tilt-max','10');
        el.innerHTML = `
            <div class="skill-group-icon"><i class="${cfg.icon}" style="color:var(--neon-cyan)"></i></div>
            <h4>${cfg.label}</h4>
            <div class="skill-tags">${tags.map(t=>`<span>${t}</span>`).join('')}</div>`;
        grid.appendChild(el);
    });
}

/* Projects with metrics overlay */
const cardColorMap = { purple:'c-purple', blue:'c-blue', cyan:'c-default' };

function renderProjects(projects) {
    const grid = document.getElementById('projects-grid');
    grid.innerHTML = '';
    projects.forEach((p, i) => {
        const cls = cardColorMap[p.color] || 'c-default';
        const highlight = p.highlight ? `<div class="project-highlight"><i class="fas fa-bolt"></i>${p.highlight}</div>` : '';
        const m = p.metrics || {};
        const card = document.createElement('div');
        card.className = `project-card ${cls} reveal d${i+1}`;
        card.setAttribute('data-tilt',''); card.setAttribute('data-tilt-max','7');
        card.innerHTML = `
            <div class="metrics-overlay">
                <div class="metrics-title"><i class="fas fa-chart-bar"></i> Model Performance</div>
                <div class="metrics-grid">
                    <div class="metric-item"><div class="metric-val">${m.accuracy||'—'}</div><div class="metric-label">Accuracy</div></div>
                    <div class="metric-item"><div class="metric-val">${m.precision||'—'}</div><div class="metric-label">Precision</div></div>
                    <div class="metric-item"><div class="metric-val">${m.recall||'—'}</div><div class="metric-label">Recall</div></div>
                </div>
                <div class="metrics-hint"><i class="fas fa-mouse-pointer"></i> Move away to close</div>
            </div>
            <div class="card-header">
                <div class="card-icon"><i class="${p.icon}"></i></div>
                <span class="card-tag">${p.tag}</span>
            </div>
            <h3>${p.title}</h3>
            <p>${p.description}</p>
            ${highlight}
            <div class="card-footer">${p.tech.map(t=>`<span class="tech-pill">${t}</span>`).join('')}</div>`;
        grid.appendChild(card);
    });
}

/* Achievements */
function renderAchievements(list) {
    const container = document.getElementById('timeline-container');
    container.innerHTML = '';
    list.forEach((a, i) => {
        const item = document.createElement('div');
        item.className = `timeline-item reveal d${(i%4)+1}`;
        item.innerHTML = `
            <div class="timeline-dot"><i class="${a.icon}"></i></div>
            <div class="timeline-content glass-panel">
                <span class="timeline-date">${a.date}</span>
                <h4>${a.title}</h4>
                <p>${a.desc}</p>
            </div>`;
        container.appendChild(item);
    });
}

/* Contact Links */
function renderContactLinks(p) {
    document.getElementById('contact-links').innerHTML = `
        <a href="mailto:${p.email}"><i class="fas fa-envelope"></i>${p.email}</a>
        <a href="tel:${p.phone}"><i class="fas fa-phone"></i>${p.phone}</a>
        <a href="#"><i class="fas fa-map-marker-alt"></i>${p.location}</a>
        <div class="social-row">
            <a href="${p.links.github}" class="social-icon" target="_blank" rel="noopener"><i class="fab fa-github"></i></a>
            <a href="${p.links.linkedin}" class="social-icon" target="_blank" rel="noopener"><i class="fab fa-linkedin"></i></a>
        </div>
        <a href="${p.resume||'#'}" class="neon-btn download-btn" target="_blank" rel="noopener"><i class="fas fa-download"></i> Download Resume</a>`;
}

/* ── CONTACT MODAL ── */
const overlay = document.getElementById('contact-overlay');
function openContact() { overlay.classList.add('active'); document.body.style.overflow = 'hidden'; }
function closeContact() { overlay.classList.remove('active'); document.body.style.overflow = ''; }

document.getElementById('open-contact-btn').addEventListener('click', e => { e.preventDefault(); openContact(); });
document.getElementById('open-contact-btn-fixed').addEventListener('click', openContact);
document.getElementById('close-modal').addEventListener('click', closeContact);
overlay.addEventListener('click', e => { if (e.target === overlay) closeContact(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeContact(); });

document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = this.querySelector('.submit-btn');
    btn.innerHTML = '<i class="fas fa-check-circle"></i> Transmission Sent!';
    btn.style.borderColor = '#00f2ff'; btn.style.color = '#fff';
    setTimeout(() => {
        btn.innerHTML = 'Initiate Transfer <i class="fas fa-paper-plane"></i>';
        btn.style.borderColor = ''; btn.style.color = '';
        this.reset();
    }, 3000);
});

/* ── BOOT ── */
loadData();
