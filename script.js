/** ═══════════════════════════════════════════
 *  PIXEL CYBER PORTFOLIO - REVAMPED JS
 *  Performance-Optimized Build
 *  ═══════════════════════════════════════════ */

/** SET THE GOOGLE APPS SCRIPT WEB APP URL HERE **/
const API_URL = 'https://script.google.com/macros/s/AKfycbxRYTRqAXnMRA0LVEPqtfg1j5G6vzY2VXZjhUIy4yeZZ39C9imPXNqLoRx-PqUhvR6l7g/exec?api=true';
const BASE_URL = API_URL.replace('?api=true', '');

/** Detect mobile / touch device */
const IS_MOBILE = window.matchMedia('(max-width: 768px)').matches;
const IS_TOUCH  = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;

let allProjects = []; // Store all fetched projects for filtering

// ═══════════════════════════════════════════
// ICONS — inline SVG markup for icons injected dynamically via JS
// (theme toggle, CV button spinner, project card links). Sourced directly
// from lucide-static@1.24.0, same version the static HTML icons use, so
// everything stays pixel-identical. No external icon library is loaded.
// ═══════════════════════════════════════════
const ICON_WRAP_OPEN = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const ICONS = {
    moon: '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />',
    sun: '<circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />',
    loader: '<path d="M12 2v4" /><path d="m16.2 7.8 2.9-2.9" /><path d="M18 12h4" /><path d="m16.2 16.2 2.9 2.9" /><path d="M12 18v4" /><path d="m4.9 19.1 2.9-2.9" /><path d="M2 12h4" /><path d="m4.9 4.9 2.9 2.9" />',
    'external-link': '<path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />',
    menu: '<path d="M4 5h16" /><path d="M4 12h16" /><path d="M4 19h16" />',
    x: '<path d="M18 6 6 18" /><path d="m6 6 12 12" />'
};
// Returns a full inline <svg>...</svg> string for a given icon name + extra attrs (e.g. class/style)
function iconSvg(name, extraAttrs = '') {
    return `<svg ${ICON_WRAP_OPEN}${extraAttrs}>${ICONS[name]}</svg>`;
}

// ═══════════════════════════════════════════
// 1. PARTICLE STARFIELD BACKGROUND
// ═══════════════════════════════════════════
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];

    // Drastically reduce on mobile: 25 vs 80
    const PARTICLE_COUNT = IS_MOBILE ? 25 : 80;
    // Disable connection lines on mobile (O(n²) loop is very expensive)
    const DRAW_CONNECTIONS = !IS_MOBILE;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize, { passive: true });
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

        // Draw connections only on desktop
        if (DRAW_CONNECTIONS) {
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

    // Reading scrollHeight forces the browser to recalculate layout ("forced
    // reflow"). Doing that on EVERY scroll event was the source of the
    // forced-reflow warning. Instead, cache it and only recompute when the
    // document's height can actually change (resize, or new content loaded
    // via ResizeObserver) — never inside the scroll handler itself.
    let docHeight = document.documentElement.scrollHeight - window.innerHeight;

    const recalc = () => {
        docHeight = document.documentElement.scrollHeight - window.innerHeight;
    };
    window.addEventListener('resize', recalc, { passive: true });

    if (window.ResizeObserver) {
        new ResizeObserver(recalc).observe(document.body);
    } else {
        // Fallback for older browsers: recalc after async content (projects/certs) loads
        window.addEventListener('load', recalc, { passive: true });
    }

    // rAF-throttle the write too, so we only touch style.width once per frame
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
            bar.style.width = progress + '%';
            ticking = false;
        });
    }, { passive: true });
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
    const text = 'Membangun ekosistem digital cerdas melalui UI/UX, Web, Data, dan Jaringan.';
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
    const icon = document.getElementById('themeIcon'); // this is now an <svg> element directly
    if (!btn || !icon) return;
    const saved = localStorage.getItem('portfolio-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);

    // Set initial icon: just swap the SVG's inner paths, no library needed
    icon.innerHTML = ICONS[saved === 'dark' ? 'moon' : 'sun'];

    btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('portfolio-theme', next);

        // Update icon
        icon.innerHTML = ICONS[next === 'dark' ? 'moon' : 'sun'];
    });
}

// ═══════════════════════════════════════════
// 5b. MOBILE NAV (hamburger toggle)
// On mobile, nav links are hidden until this button is tapped —
// see the @media (max-width: 768px) rules for #mainHeader.nav-open.
// ═══════════════════════════════════════════
function initNavToggle() {
    const btn = document.getElementById('navToggle');
    const header = document.getElementById('mainHeader');
    const nav = document.getElementById('mainNav');
    const icon = document.getElementById('navToggleIcon');
    if (!btn || !header || !nav || !icon) return;

    const closeMenu = () => {
        header.classList.remove('nav-open');
        btn.setAttribute('aria-expanded', 'false');
        icon.innerHTML = ICONS.menu;
    };
    const openMenu = () => {
        header.classList.add('nav-open');
        btn.setAttribute('aria-expanded', 'true');
        icon.innerHTML = ICONS.x;
    };

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        header.classList.contains('nav-open') ? closeMenu() : openMenu();
    });

    // Tapping a link navigates the single-page anchor — close the menu after
    nav.querySelectorAll('.nav-btn').forEach(link => link.addEventListener('click', closeMenu));

    // Tapping outside the header closes it
    document.addEventListener('click', (e) => {
        if (header.classList.contains('nav-open') && !header.contains(e.target)) closeMenu();
    });

    // Escape closes it and returns focus to the toggle button
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && header.classList.contains('nav-open')) {
            closeMenu();
            btn.focus();
        }
    });
}

// ═══════════════════════════════════════════
// 6. 3D TILT EFFECT ON PROJECT CARDS
// ═══════════════════════════════════════════
function initTiltEffect() {
    // Skip entirely on touch devices (no mousemove = useless, wastes memory)
    if (IS_TOUCH) return;

    let rafId = null; // throttle via requestAnimationFrame
    document.addEventListener('mousemove', (e) => {
        if (rafId) return; // skip if already queued
        rafId = requestAnimationFrame(() => {
            rafId = null;
            document.querySelectorAll('.project-card:not(.hidden)').forEach(card => {
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
    });
}

// ═══════════════════════════════════════════
// 7. FETCH & DISPLAY PROJECTS
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
        allProjects = await response.json();
        loadingState.style.display = 'none';

        if (allProjects.length === 0) { 
            emptyState.style.display = 'block'; 
            return; 
        }

        renderProjects(allProjects);
        initCategoryFilter();
        populateCVProjects(allProjects);

    } catch (error) {
        console.error('Error fetching projects:', error);
        loadingState.style.display = 'none';
        errorState.style.display = 'block';
    }
}

function populateCVProjects(projects) {
    const list = document.getElementById('cv-projects-list');
    if (!list) return;

    if (!projects || projects.length === 0) {
        list.innerHTML = '<li style="color: #666; font-style: italic; list-style-type: none;">Belum ada data proyek.</li>';
        return;
    }

    list.innerHTML = '';
    projects.forEach(p => {
        const li = document.createElement('li');
        li.style.marginBottom = '12px';
        li.innerHTML = `<strong>${p.title}</strong> <span style="color:#555; font-size:12px;">(${p.category || 'Lainnya'})</span><br><span style="color:#444;">${p.description}</span>`;
        list.appendChild(li);
    });
}

function renderProjects(projectsToRender) {
    const container = document.getElementById('projects-container');
    container.innerHTML = ''; // Clear container
    
    if (projectsToRender.length === 0) {
        container.innerHTML = '<p class="modern-text" style="grid-column: 1/-1; text-align: center;">Tidak ada quest di kategori ini.</p>';
        return;
    }

    projectsToRender.forEach(project => {
        const card = createProjectCard(project);
        container.appendChild(card);
    });

    // Note: we deliberately do NOT call initTiltEffect() here — it already
    // re-queries .project-card live on every mousemove, so new cards are
    // picked up automatically. Calling it again on every filter click was
    // stacking duplicate document-level mousemove listeners (each doing its
    // own getBoundingClientRect reads), which compounded into worse and
    // worse jank the more you filtered. Cards below use inline SVG already,
    // so no icon re-render step is needed either.
}

function createProjectCard(project) {
    const div = document.createElement('div');
    div.className = 'project-card cyber-box';
    div.setAttribute('role', 'listitem');

    let rawImg = project.imageUrl || '';
    if (rawImg && rawImg.includes('github.com') && rawImg.includes('/blob/')) {
        rawImg = rawImg.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    }
    
    // Fix Google Drive Embed (Bypass CORB)
    if (rawImg && rawImg.includes('drive.google.com')) {
        const matchId = rawImg.match(/[?&]id=([^&]+)/) || rawImg.match(/file\/d\/([^\/]+)/);
        if (matchId && matchId[1]) {
            rawImg = `https://drive.google.com/thumbnail?id=${matchId[1]}&sz=w600`;
        }
    }
    
    const imgUrl = rawImg || 'img/project_fallback.png';
    const link = project.link || '#';
    const cat = project.category || 'Lainnya'; 

    div.innerHTML = `
        <div class="project-img-container">
            <span class="project-category-badge">${cat.toUpperCase()}</span>
            <img src="${imgUrl}" alt="${project.title}" class="project-img" loading="lazy" decoding="async" width="350" height="200" onerror="this.onerror=null; this.src='img/project_fallback.png';">
        </div>
        <div class="project-info">
            <h3 class="project-title">${project.title}</h3>
            <p class="project-desc">${project.description}</p>
            <a href="${link}" class="btn outline-btn" target="_blank" rel="noopener noreferrer">
                ${iconSvg('external-link', ' style="width:14px;height:14px;"')} ACCESS DATA
            </a>
        </div>
    `;
    return div;
}

// ═══════════════════════════════════════════
// 7B. FETCH & DISPLAY CERTIFICATIONS
// ═══════════════════════════════════════════
let allCerts = [];

async function fetchCertifications() {
    const container = document.getElementById('certs-container');
    const loadingState = document.getElementById('certs-loading');
    const emptyState = document.getElementById('certs-empty');
    if (!container) return;

    if (API_URL.includes('GANTI_DENGAN_URL')) {
        loadingState.style.display = 'none'; return;
    }

    try {
        const response = await fetch(BASE_URL + '?api=certifications', { method: 'GET', redirect: 'follow' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        allCerts = await response.json();
        loadingState.style.display = 'none';

        if (allCerts.length === 0) { 
            emptyState.style.display = 'block'; 
            return; 
        }

        renderCertifications(allCerts);
        populateCVCerts(allCerts);

    } catch (error) {
        console.error('Error fetching certs:', error);
        loadingState.style.display = 'none';
        emptyState.style.display = 'block';
    }
}

function renderCertifications(certs) {
    const container = document.getElementById('certs-container');
    container.innerHTML = '';
    
    certs.forEach(cert => {
        const div = document.createElement('div');
        div.className = 'project-card cyber-box';
        
        let rawImg = cert.imageUrl || 'img/project_fallback.png';
        if (rawImg && rawImg.includes('github.com') && rawImg.includes('/blob/')) {
            rawImg = rawImg.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
        }
        
        // Fix Google Drive Embed (Bypass CORB)
        if (rawImg && rawImg.includes('drive.google.com')) {
            const matchId = rawImg.match(/[?&]id=([^&]+)/) || rawImg.match(/file\/d\/([^\/]+)/);
            if (matchId && matchId[1]) {
                rawImg = `https://drive.google.com/thumbnail?id=${matchId[1]}&sz=w1000`;
            }
        }

        div.innerHTML = `
            <div class="project-img-container cert-img" style="height:220px; border-bottom: 1px solid var(--border-dim);">
                <img src="${rawImg}" alt="${cert.title}" class="project-img" style="object-fit:contain; background:rgba(0,0,0,0.5); padding:15px;" onerror="this.onerror=null; this.src='img/project_fallback.png';">
            </div>
            <div class="project-info" style="padding: 20px; flex-grow:1; display:flex; align-items:center; justify-content:center;">
                <h3 class="project-title" style="text-align: center; margin: 0; font-size: 15px; line-height: 1.5; color: var(--neon-cyan); text-transform: capitalize;">${cert.title}</h3>
            </div>
        `;
        container.appendChild(div);
    });
}

function populateCVCerts(certs) {
    const list = document.getElementById('cv-certs-list');
    if (!list) return;

    if (!certs || certs.length === 0) {
        list.parentElement.style.display = 'none'; 
        return;
    }

    list.parentElement.style.display = 'block';
    list.innerHTML = '';
    certs.forEach(c => {
        const li = document.createElement('li');
        li.style.marginBottom = '8px';
        li.innerHTML = `<strong>${c.title}</strong>`;
        list.appendChild(li);
    });
}

// ═══════════════════════════════════════════
// 8. CATEGORY FILTER LOGIC
// ═══════════════════════════════════════════
function initCategoryFilter() {
    const tabs = document.querySelectorAll('.category-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            
            const category = tab.getAttribute('data-category');
            
            if (category === 'all') {
                renderProjects(allProjects);
            } else {
                // Filter projects by exact category string match
                const filtered = allProjects.filter(p => 
                    p.category && p.category.toLowerCase() === category.toLowerCase()
                );
                renderProjects(filtered);
            }
        });
    });
}

// ═══════════════════════════════════════════
// 9. WHATSAPP CONTACT FORM
// ═══════════════════════════════════════════
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('contactName').value;
        const email = document.getElementById('contactEmail').value;
        const message = document.getElementById('contactMessage').value;
        
        // Format WhatsApp Message
        const waMessage = `Halo Erman, saya ${name} (${email}).%0A%0A${message}`;
        
        // Redirect to WhatsApp
        const waUrl = `https://wa.me/6281340882207?text=${waMessage}`;
        window.open(waUrl, '_blank');
        
        // Reset form
        form.reset();
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
// 11. DOWNLOAD CV VIA HTML2PDF
//     Lazy-load the library only when the button is clicked
// ═══════════════════════════════════════════
function initDownloadCV() {
    const btn = document.getElementById('downloadCvBtn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        // Lazy-load html2pdf: only injected when first needed
        if (!window.html2pdf) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            script.onload = () => generatePDF(btn);
            document.head.appendChild(script);
        } else {
            generatePDF(btn);
        }
    });
}

function generatePDF(btn) {
    const element = document.getElementById('cv-template');
    element.style.display = 'block';
    
    const opt = {
        margin:       0,
        filename:     'CV_Erman_Saputra_IT.pdf',
        image:        { type: 'jpeg', quality: 0.95 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    const originalHTML = btn.innerHTML;
    btn.innerHTML = `${iconSvg('loader', ' class="spin-icon" style="width:14px;height:14px;margin-right:6px;"')} GENERATING...`;

    html2pdf().set(opt).from(element).save().then(() => {
        element.style.display = 'none';
        btn.innerHTML = originalHTML;
    });
}

// ═══════════════════════════════════════════
// 12. SMOOTH SCROLL
// ═══════════════════════════════════════════
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// ═══════════════════════════════════════════
// INIT ALL ON DOM READY
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    // Critical inits (immediate)
    initScrollProgress();
    initScrollReveal();
    initThemeToggle();
    initNavToggle();
    initSmoothScroll();
    initContactForm();
    initDownloadCV();

    // Non-critical: defer with requestIdleCallback / setTimeout
    const defer = window.requestIdleCallback || ((cb) => setTimeout(cb, 200));
    defer(() => {
        initParticles();
        initTypingEffect();
        initTiltEffect(); // no-op on touch devices
    });

    // Fetch data from backend
    fetchProjects();
    fetchCertifications();
    initVisitorCounter();
});