/** ═══════════════════════════════════════════
 *  PIXEL CYBER PORTFOLIO - FULL FEATURE JS
 *  ═══════════════════════════════════════════ */

/** SET THE GOOGLE APPS SCRIPT WEB APP URL HERE **/
const API_URL = 'https://script.google.com/macros/s/AKfycbx6e1aF1qXP00lPZ1nuulssS8sY2KUWnpcVu2YqqGEZDBtzwiRniuPZ3QxNVRHZ54Tg8g/exec?api=true';
const BASE_URL = API_URL.replace('?api=true', '');

// ═══════════════════════════════════════════
// 1. PARTICLE STARFIELD BACKGROUND
// ═══════════════════════════════════════════
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 80;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * 0.4,
            speedY: (Math.random() - 0.5) * 0.4,
            opacity: Math.random() * 0.7 + 0.3
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = isDark ? `rgba(0, 240, 255, ${p.opacity})` : `rgba(0, 100, 150, ${p.opacity * 0.5})`;
            ctx.fill();
            p.x += p.speedX;
            p.y += p.speedY;
            if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        });

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = isDark ? `rgba(0, 240, 255, ${0.15 * (1 - dist / 120)})` : `rgba(0,100,150, ${0.1 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}

// ═══════════════════════════════════════════
// 2. SCROLL PROGRESS BAR
// ═══════════════════════════════════════════
function initScrollProgress() {
    const bar = document.getElementById('scrollProgressBar');
    if (!bar) return;
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        bar.style.width = progress + '%';
    });
}

// ═══════════════════════════════════════════
// 3. SCROLL REVEAL ANIMATION
// ═══════════════════════════════════════════
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    revealElements.forEach(el => observer.observe(el));
}

// ═══════════════════════════════════════════
// 4. TYPING EFFECT
// ═══════════════════════════════════════════
function initTypingEffect() {
    const target = document.getElementById('typing-target');
    if (!target) return;
    const text = 'Membangun website modern dengan performa tinggi & desain interaktif.';
    let i = 0;
    function type() {
        if (i < text.length) {
            target.textContent += text.charAt(i);
            i++;
            setTimeout(type, 40);
        }
    }
    // Start typing when hero is visible
    const heroObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            type();
            heroObserver.disconnect();
        }
    });
    heroObserver.observe(target);
}

// ═══════════════════════════════════════════
// 5. DARK/LIGHT THEME TOGGLE
// ═══════════════════════════════════════════
function initThemeToggle() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const saved = localStorage.getItem('portfolio-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    btn.textContent = saved === 'dark' ? '🌙' : '☀️';

    btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('portfolio-theme', next);
        btn.textContent = next === 'dark' ? '🌙' : '☀️';
    });
}

// ═══════════════════════════════════════════
// 6. 3D TILT EFFECT ON PROJECT CARDS
// ═══════════════════════════════════════════
function initTiltEffect() {
    document.addEventListener('mousemove', (e) => {
        document.querySelectorAll('.project-card').forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;
                card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            } else {
                card.style.transform = '';
            }
        });
    });
}

// ═══════════════════════════════════════════
// 7. INTERACTIVE TERMINAL
// ═══════════════════════════════════════════
function initTerminal() {
    const input = document.getElementById('terminalInput');
    const body = document.getElementById('terminalBody');
    if (!input || !body) return;

    const commands = {
        help: () => `Available commands:\n  <span class="cmd-highlight">about</span>    - Info tentang saya\n  <span class="cmd-highlight">skills</span>   - Daftar skill\n  <span class="cmd-highlight">projects</span> - Lihat proyek\n  <span class="cmd-highlight">contact</span>  - Info kontak\n  <span class="cmd-highlight">education</span>- Riwayat pendidikan\n  <span class="cmd-highlight">clear</span>    - Bersihkan terminal\n  <span class="cmd-highlight">hello</span>    - Sapa saya!`,
        about: () => `Name: Erman Saputra\nRole: Fullstack Web Developer\nMission: Membangun website modern & interaktif\nLocation: Indonesia`,
        skills: () => `[■■■■■■■■■■] HTML/CSS    - LV.MAX\n[■■■■■■■■░░] JavaScript  - LV.80\n[■■■■■■■░░░] React.js    - LV.75\n[■■■■■■■■■░] Apps Script - LV.90\n[■■■■■■■■░░] UI/UX       - LV.85`,
        projects: () => { document.getElementById('projects').scrollIntoView({behavior:'smooth'}); return 'Scrolling to PORTFOLIO ARCHIVE...'; },
        contact: () => `WhatsApp: 081340882207\nGitHub: github.com/Erman4u\nEmail: (tersedia di form kontak di bawah)`,
        education: () => `S1 Informatika\nUniversitas AMIKOM Yogyakarta\nStatus: COMPLETE ✅`,
        hello: () => `Halo! 👋 Terima kasih sudah mengunjungi portofolio saya!\nKetik "help" untuk melihat perintah lainnya.`,
        clear: () => { body.innerHTML = ''; return null; }
    };

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = input.value.trim().toLowerCase();
            if (!cmd) return;

            // Show user's command
            const cmdLine = document.createElement('p');
            cmdLine.className = 'terminal-line';
            cmdLine.innerHTML = `<span style="color:var(--neon-cyan);">erman@portfolio:~$</span> ${cmd}`;
            body.appendChild(cmdLine);

            // Process
            if (commands[cmd]) {
                const result = commands[cmd]();
                if (result) {
                    const output = document.createElement('p');
                    output.className = 'terminal-line';
                    output.innerHTML = result.replace(/\n/g, '<br>');
                    body.appendChild(output);
                }
            } else {
                const err = document.createElement('p');
                err.className = 'terminal-line';
                err.innerHTML = `<span style="color:var(--neon-pink);">Command not found: "${cmd}"</span>. Type <span class="cmd-highlight">help</span> for list.`;
                body.appendChild(err);
            }

            input.value = '';
            body.scrollTop = body.scrollHeight;
        }
    });
}

// ═══════════════════════════════════════════
// 8. FETCH & DISPLAY PROJECTS
// ═══════════════════════════════════════════
async function fetchProjects() {
    const container = document.getElementById('projects-container');
    const loadingState = document.getElementById('loading');
    const errorState = document.getElementById('api-error');
    const emptyState = document.getElementById('empty-state');

    if (API_URL.includes('GANTI_DENGAN_URL')) {
        loadingState.style.display = 'none';
        errorState.style.display = 'block';
        return;
    }

    try {
        const response = await fetch(API_URL, { method: 'GET', redirect: 'follow' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const projects = await response.json();
        loadingState.style.display = 'none';

        if (projects.length === 0) { emptyState.style.display = 'block'; return; }

        projects.forEach(project => {
            const card = createProjectCard(project);
            container.appendChild(card);
        });

        // Init tilt after cards are loaded
        initTiltEffect();

    } catch (error) {
        console.error('Error fetching projects:', error);
        loadingState.style.display = 'none';
        errorState.style.display = 'block';
    }
}

function createProjectCard(project) {
    const div = document.createElement('div');
    div.className = 'project-card cyber-box';

    let rawImg = project.imageUrl;
    if (rawImg && rawImg.includes('github.com') && rawImg.includes('/blob/')) {
        rawImg = rawImg.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    }
    const imgUrl = rawImg || 'https://via.placeholder.com/600x400.png?text=No+Image';
    const link = project.link || '#';

    div.innerHTML = `
        <div class="project-img-container">
            <img src="${imgUrl}" alt="${project.title}" class="project-img">
        </div>
        <div class="project-info">
            <h3 class="project-title">${project.title}</h3>
            <p class="project-desc">${project.description}</p>
            <a href="${link}" class="btn outline-btn" target="_blank" rel="noopener noreferrer">ACCESS DATA</a>
        </div>
    `;
    return div;
}

// ═══════════════════════════════════════════
// 9. CONTACT FORM → GOOGLE SHEET
// ═══════════════════════════════════════════
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('contactSubmitBtn');
        const status = document.getElementById('contactStatus');
        btn.disabled = true;
        btn.textContent = 'TRANSMITTING...';
        status.textContent = '';

        const data = {
            action: 'contact',
            name: document.getElementById('contactName').value,
            email: document.getElementById('contactEmail').value,
            message: document.getElementById('contactMessage').value
        };

        try {
            const res = await fetch(BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            status.textContent = result.message || 'Pesan berhasil dikirim!';
            status.style.color = 'var(--neon-cyan)';
            form.reset();
        } catch (err) {
            status.textContent = 'Error mengirim pesan. Coba hubungi via WhatsApp.';
            status.style.color = 'var(--neon-pink)';
        }
        btn.disabled = false;
        btn.textContent = 'TRANSMIT MESSAGE';
    });
}

// ═══════════════════════════════════════════
// 10. VISITOR COUNTER
// ═══════════════════════════════════════════
async function initVisitorCounter() {
    const el = document.getElementById('visitorCount');
    if (!el) return;
    try {
        const res = await fetch(BASE_URL + '?api=visitor', { redirect: 'follow' });
        const data = await res.json();
        el.textContent = data.count || '0';
    } catch { el.textContent = '---'; }
}

// ═══════════════════════════════════════════
// 11. TESTIMONIALS
// ═══════════════════════════════════════════
async function fetchTestimonials() {
    const container = document.getElementById('testimonials-container');
    const empty = document.getElementById('testimonials-empty');
    if (!container) return;
    try {
        const res = await fetch(BASE_URL + '?api=testimonials', { redirect: 'follow' });
        const testimonials = await res.json();
        if (!testimonials || testimonials.length === 0) { empty.style.display = 'block'; return; }
        testimonials.forEach(t => {
            const card = document.createElement('div');
            card.className = 'testimonial-card';
            const stars = '★'.repeat(t.rating || 5) + '☆'.repeat(5 - (t.rating || 5));
            card.innerHTML = `
                <p class="testimonial-name">${t.name}</p>
                <p class="testimonial-stars">${stars}</p>
                <p class="testimonial-text">"${t.text}"</p>
            `;
            container.appendChild(card);
        });
    } catch (e) {
        console.log('Testimonials not available:', e);
        empty.style.display = 'block';
    }
}

// ═══════════════════════════════════════════
// 12. SMOOTH SCROLL
// ═══════════════════════════════════════════
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// ═══════════════════════════════════════════
// INIT ALL ON DOM READY
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initScrollProgress();
    initScrollReveal();
    initTypingEffect();
    initThemeToggle();
    initTerminal();
    initSmoothScroll();
    initContactForm();
    
    // Fetch data from backend
    fetchProjects();
    fetchTestimonials();
    initVisitorCounter();
});
