/** ═══════════════════════════════════════════
 *  PIXEL CYBER PORTFOLIO - REVAMPED JS
 *  ═══════════════════════════════════════════ */

/** SET THE GOOGLE APPS SCRIPT WEB APP URL HERE **/
const API_URL = 'https://script.google.com/macros/s/AKfycbxRYTRqAXnMRA0LVEPqtfg1j5G6vzY2VXZjhUIy4yeZZ39C9imPXNqLoRx-PqUhvR6l7g/exec?api=true';
const BASE_URL = API_URL.replace('?api=true', '');

let allProjects = []; // Store all fetched projects for filtering

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
    const icon = document.getElementById('themeIcon');
    if (!btn || !icon) return;
    const saved = localStorage.getItem('portfolio-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    
    // Set initial icon using Lucide if loaded
    if (window.lucide) {
        icon.setAttribute('data-lucide', saved === 'dark' ? 'moon' : 'sun');
        lucide.createIcons();
    }

    btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('portfolio-theme', next);
        
        // Update icon
        if (window.lucide) {
            icon.setAttribute('data-lucide', next === 'dark' ? 'moon' : 'sun');
            lucide.createIcons();
        }
    });
}

// ═══════════════════════════════════════════
// 6. 3D TILT EFFECT ON PROJECT CARDS
// ═══════════════════════════════════════════
function initTiltEffect() {
    document.addEventListener('mousemove', (e) => {
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

    // Re-initialize icons and tilt effect for new elements
    if (window.lucide) lucide.createIcons();
    initTiltEffect();
}

function createProjectCard(project) {
    const div = document.createElement('div');
    div.className = 'project-card cyber-box';

    let rawImg = project.imageUrl || 'img/project_fallback.png';
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
    
    const imgUrl = rawImg;
    const link = project.link || '#';
    // Fallback category if not provided
    const cat = project.category || 'Lainnya'; 

    div.innerHTML = `
        <div class="project-img-container">
            <span class="project-category-badge">${cat.toUpperCase()}</span>
            <img src="${imgUrl}" alt="${project.title}" class="project-img" onerror="this.onerror=null; this.src='img/project_fallback.png';">
        </div>
        <div class="project-info">
            <h3 class="project-title">${project.title}</h3>
            <p class="project-desc">${project.description}</p>
            <a href="${link}" class="btn outline-btn" target="_blank" rel="noopener noreferrer">
                <i data-lucide="external-link" style="width:14px;height:14px;"></i> ACCESS DATA
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
            <div class="project-img-container" style="height:220px; border-bottom: 1px solid var(--border-dim);">
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
// ═══════════════════════════════════════════
function initDownloadCV() {
    const btn = document.getElementById('downloadCvBtn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const element = document.getElementById('cv-template');
        
        // Show temporarily to generate PDF
        element.style.display = 'block';
        
        const opt = {
            margin:       0,
            filename:     'CV_Erman_Saputra_IT.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        // Change button state
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i data-lucide="loader" class="spin-icon" style="width:14px;height:14px;margin-right:6px;"></i> GENERATING...';
        if (window.lucide) lucide.createIcons();

        // Generate PDF
        html2pdf().set(opt).from(element).save().then(() => {
            // Restore state
            element.style.display = 'none';
            btn.innerHTML = originalText;
            if (window.lucide) lucide.createIcons();
        });
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
    // Initialize Lucide icons
    if (window.lucide) lucide.createIcons();
    
    initParticles();
    initScrollProgress();
    initScrollReveal();
    initTypingEffect();
    initThemeToggle();
    initSmoothScroll();
    initContactForm();
    initDownloadCV();
    
    // Fetch data from backend
    fetchProjects();
    fetchCertifications();
    initVisitorCounter();
});
