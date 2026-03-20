// =========================================
// 1. ENHANCED NEURAL BACKGROUND — NEON GREEN
// =========================================
(function initNeuralBackground() {
    const canvas = document.getElementById("neural-bg");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    const particleCount = isMobile ? 45 : 90;
    const connectionDistance = 130;
    const mouseRadius = 160;
    let mouse = { x: null, y: null };
    let animationId;
    let particles = [];
    let time = 0;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { resizeCanvas(); init(); }, 200);
    });
    resizeCanvas();

    window.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener("mouseout", () => { mouse.x = null; mouse.y = null; });

    class Particle {
        constructor() { this.reset(true); }

        reset(randomY = false) {
            this.x = Math.random() * canvas.width;
            this.y = randomY ? Math.random() * canvas.height : Math.random() * canvas.height;
            this.baseSize = Math.random() * 1.5 + 0.8;
            this.size = this.baseSize;
            this.speedX = (Math.random() - 0.5) * 0.6;
            this.speedY = (Math.random() - 0.5) * 0.6;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.pulseSpeed = Math.random() * 0.02 + 0.01;
            this.pulseOffset = Math.random() * Math.PI * 2;
            this.isHot = Math.random() < 0.08;
        }

        update(t) {
            this.x += this.speedX;
            this.y += this.speedY;
            this.size = this.baseSize + Math.sin(t * this.pulseSpeed + this.pulseOffset) * 0.5;

            const margin = 10;
            if (this.x < -margin) this.x = canvas.width + margin;
            if (this.x > canvas.width + margin) this.x = -margin;
            if (this.y < -margin) this.y = canvas.height + margin;
            if (this.y > canvas.height + margin) this.y = -margin;

            if (mouse.x !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouseRadius) {
                    const force = (mouseRadius - dist) / mouseRadius;
                    const angle = Math.atan2(dy, dx);
                    this.x -= Math.cos(angle) * force * 2.5;
                    this.y -= Math.sin(angle) * force * 2.5;
                }
            }
        }

        draw() {
            const alpha = this.isHot ? Math.min(this.opacity * 1.8, 0.9) : this.opacity;
            const color = this.isHot ? `rgba(56, 189, 248, ${alpha})` : `rgba(14, 165, 233, ${alpha})`;

            ctx.save();
            if (this.isHot) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
            }
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function connectParticles() {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const distSq = dx * dx + dy * dy;
                if (distSq < connectionDistance * connectionDistance) {
                    const dist = Math.sqrt(distSq);
                    const t = 1 - dist / connectionDistance;
                    const isHotLink = particles[a].isHot || particles[b].isHot;
                    const base = isHotLink ? 0.22 : 0.1;
                    const alpha = t * base;

                    const gradient = ctx.createLinearGradient(
                        particles[a].x, particles[a].y, particles[b].x, particles[b].y
                    );
                    gradient.addColorStop(0, `rgba(56, 189, 248, ${alpha})`);
                    gradient.addColorStop(0.5, `rgba(2, 132, 199, ${alpha * 0.6})`);
                    gradient.addColorStop(1, `rgba(56, 189, 248, ${alpha})`);

                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = isHotLink ? 1.2 : 0.7;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function init() {
        particles = [];
        for (let i = 0; i < particleCount; i++) particles.push(new Particle());
    }

    function animate() {
        time++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(time); p.draw(); });
        connectParticles();
        animationId = requestAnimationFrame(animate);
    }

    init();
    animate();

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            animate();
        }
    });
})();

// =========================================
// 2. SCROLL PROGRESS
// =========================================
(function initScrollProgress() {
    const bar = document.querySelector('.scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
        const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        bar.style.width = pct + '%';
    }, { passive: true });
})();

// =========================================
// 3. MOBILE MENU
// =========================================
(function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('active');
        toggle.setAttribute('aria-expanded', isOpen);
        const spans = toggle.querySelectorAll('span');
        if (isOpen) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = '';
            spans[1].style.opacity = '1';
            spans[2].style.transform = '';
        }
    });

    navLinks.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
            const spans = toggle.querySelectorAll('span');
            spans.forEach(s => s.style.transform = '');
            spans[1].style.opacity = '1';
        });
    });
})();

// =========================================
// 4. TYPING EFFECT
// =========================================
(function initTypeWriter() {
    const el = document.querySelector(".txt-type");
    if (!el) return;

    const words = JSON.parse(el.getAttribute("data-words"));
    const wait = parseInt(el.getAttribute("data-wait")) || 2000;
    let txt = '', wordIndex = 0, isDeleting = false;

    function type() {
        const full = words[wordIndex % words.length];
        txt = isDeleting ? full.substring(0, txt.length - 1) : full.substring(0, txt.length + 1);
        el.innerHTML = txt + '<span class="cursor">|</span>';

        let speed = isDeleting ? 45 : 95;
        if (!isDeleting && txt === full) { speed = wait; isDeleting = true; }
        else if (isDeleting && txt === '') { isDeleting = false; wordIndex++; speed = 500; }

        setTimeout(type, speed);
    }
    type();
})();

// =========================================
// 5. COUNTER ANIMATION
// =========================================
(function initCounters() {
    const counters = document.querySelectorAll(".counter");
    if (!counters.length) return;

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const counter = entry.target;
            const target = parseInt(counter.getAttribute("data-target"));
            let start = 0;
            const duration = 1500;
            const startTime = performance.now();

            function step(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const value = Math.ceil(eased * target);
                counter.textContent = value + (progress === 1 && target >= 100 ? '+' : '');
                if (progress < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
            obs.unobserve(counter);
        });
    }, { threshold: 0.5 });

    counters.forEach(c => obs.observe(c));
})();

// =========================================
// 6. SCROLL ANIMATIONS + SKILL BARS
// =========================================
(function initScrollAnimations() {
    const els = document.querySelectorAll(".scroll-animate, .glow-card, .stat-item, .timeline-item");
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add("visible");
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));

    // Skill bars
    const bars = document.querySelectorAll('.skill-bar-fill[data-width]');
    const barObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.style.width = e.target.dataset.width + '%';
                barObs.unobserve(e.target);
            }
        });
    }, { threshold: 0.3 });
    bars.forEach(b => barObs.observe(b));
})();

// =========================================
// 7. RADAR CHART (SVG)
// =========================================
(function initRadarChart() {
    const svg = document.getElementById('radarSvg');
    if (!svg) return;

    const skills = [
        { label: 'Security Engineering', val: 0.95 },
        { label: 'SIEM / Detection', val: 0.95 },
        { label: 'Cloud / DevSecOps', val: 0.88 },
        { label: 'Scripting', val: 0.82 },
        { label: 'Threat Intel', val: 0.90 },
        { label: 'Network Security', val: 0.85 }
    ];

    const cx = 160, cy = 160, R = 110, n = skills.length;
    const green = '#38bdf8';
    const greenDim = '#0284c7';

    function pt(i, r) {
        const a = (Math.PI * 2 * i / n) - Math.PI / 2;
        return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    }

    let html = '';

    // Grid circles
    [0.25, 0.5, 0.75, 1].forEach(s => {
        const pts = skills.map((_, i) => pt(i, R * s).join(',')).join(' ');
        html += `<polygon points="${pts}" fill="none" stroke="rgba(56,189,248,0.12)" stroke-width="1"/>`;
    });

    // Axes
    skills.forEach((_, i) => {
        const [x, y] = pt(i, R);
        html += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(56,189,248,0.1)" stroke-width="1"/>`;
    });

    // Data polygon
    const dataPts = skills.map((s, i) => pt(i, R * s.val).join(',')).join(' ');
    html += `<polygon points="${dataPts}" fill="rgba(56,189,248,0.1)" stroke="${green}" stroke-width="1.5"/>`;

    // Dots
    skills.forEach((s, i) => {
        const [x, y] = pt(i, R * s.val);
        html += `<circle cx="${x}" cy="${y}" r="4" fill="${green}" filter="url(#glow)"/>`;
    });

    // Labels
    skills.forEach((s, i) => {
        const [x, y] = pt(i, R + 22);
        const anchor = x < cx - 5 ? 'end' : x > cx + 5 ? 'start' : 'middle';
        html += `<text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="middle" fill="rgba(212,236,212,0.6)" font-size="9" font-family="JetBrains Mono, monospace">${s.label}</text>`;
    });

    svg.innerHTML = `
        <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
        </defs>
        ${html}
    `;
})();

// =========================================
// 8. CONTACT PAGE EFFECTS
// =========================================
(function initContactPageEffects() {
    if (!document.querySelector('.contact-container')) return;

    const orbsContainer = document.createElement('div');
    orbsContainer.className = 'contact-orbs';
    orbsContainer.innerHTML = `
        <div class="contact-orb contact-orb-1"></div>
        <div class="contact-orb contact-orb-2"></div>
        <div class="contact-orb contact-orb-3"></div>
    `;
    document.body.prepend(orbsContainer);

    const streamsContainer = document.createElement('div');
    streamsContainer.className = 'data-streams';
    const streamCount = 12;
    for (let i = 0; i < streamCount; i++) {
        const stream = document.createElement('div');
        stream.className = 'data-stream';
        stream.style.left = (Math.random() * 100) + '%';
        stream.style.height = (Math.random() * 80 + 60) + 'px';
        stream.style.animationDuration = (Math.random() * 6 + 4) + 's';
        stream.style.animationDelay = (Math.random() * 8) + 's';
        stream.style.opacity = '0';
        streamsContainer.appendChild(stream);
    }
    document.body.prepend(streamsContainer);

    const header = document.querySelector('.page-header h1');
    if (header) {
        header.style.opacity = '0';
        header.style.transform = 'translateY(20px)';
        header.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => { header.style.opacity = '1'; header.style.transform = 'translateY(0)'; }, 300);
    }

    const panels = document.querySelectorAll('.contact-info, .contact-form');
    panels.forEach((panel, i) => {
        panel.style.opacity = '0';
        panel.style.transform = 'translateY(30px)';
        panel.style.transition = 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => { panel.style.opacity = '1'; panel.style.transform = 'translateY(0)'; }, 400 + i * 180);
    });

    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            btn.style.transform = `translate(${(e.clientX - cx) * 0.3}px, ${(e.clientY - cy) * 0.3 - 4}px)`;
        });
        btn.addEventListener('mouseleave', () => { btn.style.transform = ''; btn.style.transition = 'all 0.4s ease'; });
    });

    document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
        input.addEventListener('focus', () => { const g = input.closest('.form-group'); g.style.transform = 'scale(1.01)'; g.style.transition = 'transform 0.2s ease'; });
        input.addEventListener('blur', () => { input.closest('.form-group').style.transform = ''; });
    });
})();

// =========================================
// 9. SMOOTH SCROLL
// =========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
});
