// Initialize Telegram Web App
const WebApp = window.Telegram?.WebApp;
if (WebApp) {
    WebApp.ready();
    WebApp.expand();
    WebApp.enableClosingConfirmation();
    WebApp.setHeaderColor('secondary_bg_color');
}

// Global date definition
const weddingDate = new Date("Apr 25, 2026 00:00:00").getTime();
let galleryImages = [];
let currentLightboxIndex = 0;
let thumbnailsBuilt = false;
let isMusicPlaying = false;
const bgMusic = document.getElementById('bg-music');

// ===== CORE INITIALIZATION =====
document.addEventListener("DOMContentLoaded", function () {
    // 1. Kickoff sub-initializers
    initGallery();
    initGuestLoader();
    initQRTabs();
    initCoverAndHearts();
    initCalendar();
    createFallingPetals();
    setupCountdown();
    setupAudioListeners();
    setupScrollAnimations();

    // 2. Start envelopes if already opened in session
    if (sessionStorage.getItem('inviteOpened') === '1') {
        startEnvelopes();
    }

    // 3. Listen for "Open Invite" button to start envelopes
    const openInviteBtn = document.querySelector('.open-invite-btn');
    if (openInviteBtn) {
        openInviteBtn.addEventListener('click', startEnvelopes);
    }
});

// ===== 1. GUEST IDENTIFICATION & LOADER =====
function initGuestLoader() {
    const urlParams = new URLSearchParams(window.location.search);
    
    const tryDecode = (val) => {
        if (!val) return val;
        try {
            if (val.length > 1 && /^[a-zA-Z0-9+/=]+$/.test(val)) {
                let padded = val;
                while (padded.length % 4 !== 0) padded += '=';
                return atob(padded);
            }
        } catch (e) { }
        return val;
    };

    const rawGuest = urlParams.get('guest');
    const rawTg = urlParams.get('tgWebAppStartParam');
    const rawApp = WebApp?.initDataUnsafe?.start_param;

    let guestId = rawGuest || rawTg || rawApp;
    const targetIds = [];
    if (guestId) {
        targetIds.push(guestId);
        const decoded = tryDecode(guestId);
        if (decoded !== guestId) targetIds.push(decoded);
    }

    const updateGuestUI = (name) => {
        const guestEl = document.querySelector('.guest-name');
        if (guestEl) {
            guestEl.textContent = name;
            guestEl.style.color = "var(--gold-text)";
        }
    };

    if (targetIds.length > 0) {
        fetch('guest%20list.csv')
            .then(res => res.ok ? res.text() : Promise.reject())
            .then(data => {
                const rows = data.split(/\r?\n/);
                let foundName = null;
                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i].trim();
                    if (!row) continue;
                    const parts = row.split(',');
                    const id = parts[0].trim();
                    const isMatched = targetIds.some(t => id == t || id.replace(/[^\d]/g,'') === String(t).replace(/[^\d]/g,''));
                    if (isMatched) {
                        foundName = parts[1].trim();
                        if (foundName.startsWith('"') && foundName.endsWith('"')) foundName = foundName.slice(1, -1);
                        break;
                    }
                }
                if (foundName) {
                    updateGuestUI(foundName);
                    trackLaunch(foundName);
                } else {
                    trackLaunch();
                    const firstId = targetIds[0];
                    if (isNaN(firstId) && firstId.length > 2) updateGuestUI(firstId.replace(/_/g, ' '));
                }
            })
            .catch(() => trackLaunch());
    } else if (WebApp?.initDataUnsafe?.user) {
        const user = WebApp.initDataUnsafe.user;
        const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
        if (fullName) {
            updateGuestUI(fullName);
            trackLaunch(fullName);
        } else {
            trackLaunch();
        }
    } else {
        trackLaunch();
    }
}

// ===== 2. GALLERY & LIGHTBOX =====
function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        if (img) {
            const reveal = () => { img.classList.add('loaded'); item.classList.add('loaded'); };
            img.complete ? reveal() : img.addEventListener('load', reveal);
            galleryImages.push(img.getAttribute('src'));
            item.onclick = (e) => { e.preventDefault(); openLightbox(index); };
        }
    });

    const showMoreBtn = document.getElementById('show-more-btn');
    if (showMoreBtn) {
        let occupied = 0;
        galleryItems.forEach((item, idx) => {
            let isWide = item.classList.contains('gallery-wide');
            const next = galleryItems[idx + 1];
            if (!isWide && (occupied % 2 === 0) && next?.classList.contains('gallery-wide')) {
                item.classList.add('gallery-wide');
                isWide = true;
            }
            if (!isWide && (occupied % 2 === 0) && (idx === galleryItems.length - 1)) {
                item.classList.add('gallery-wide');
                isWide = true;
            }
            const cost = isWide ? 2 : 1;
            if (occupied + cost <= 10) occupied += cost;
            else item.classList.add('gallery-extra');
        });

        showMoreBtn.addEventListener('click', () => {
            const extras = Array.from(document.querySelectorAll('.gallery-extra:not(.show)'));
            extras.slice(0, 15).forEach((item, i) => {
                item.classList.add('show');
                setTimeout(() => item.classList.add('visible'), i * 70);
            });
            if (document.querySelectorAll('.gallery-extra:not(.show)').length === 0) {
                showMoreBtn.parentElement.style.display = 'none';
            }
        });
    }
}

function openLightbox(index) {
    currentLightboxIndex = index;
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (!thumbnailsBuilt) buildThumbnails();
        updateLightbox();
    }
}

function closeLightbox() {
    const lb = document.getElementById('lightbox');
    if (lb) { lb.classList.remove('active'); document.body.style.overflow = ''; }
}

function changeLightbox(dir) {
    currentLightboxIndex = (currentLightboxIndex + dir + galleryImages.length) % galleryImages.length;
    updateLightbox();
}

function updateLightbox() {
    const img = document.getElementById('lightbox-img');
    const cnt = document.getElementById('lightbox-counter');
    if (img) img.src = galleryImages[currentLightboxIndex];
    if (cnt) cnt.textContent = `${currentLightboxIndex + 1} / ${galleryImages.length}`;
    document.querySelectorAll('.lightbox-thumb').forEach((t, i) => {
        t.classList.toggle('active', i === currentLightboxIndex);
        if (i === currentLightboxIndex) t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
}

function buildThumbnails() {
    const container = document.getElementById('lightbox-thumbnails');
    if (!container || thumbnailsBuilt) return;
    const fragment = document.createDocumentFragment();
    galleryImages.forEach((src, i) => {
        const t = document.createElement('img');
        t.src = src; t.className = 'lightbox-thumb';
        t.onclick = e => { e.stopPropagation(); currentLightboxIndex = i; updateLightbox(); };
        fragment.appendChild(t);
    });
    container.appendChild(fragment);
    thumbnailsBuilt = true;
}

// ===== 3. UI EXTRAS (Hearts, Tabs, Countdown) =====
function initCoverAndHearts() {
    const slides = document.querySelectorAll('.cover-slide');
    if (slides.length > 1) {
        let i = 0;
        setInterval(() => {
            slides[i].classList.remove('active');
            i = (i + 1) % slides.length;
            slides[i].classList.add('active');
        }, 5000);
    }

    const container = document.createElement('div');
    container.id = 'hearts-container';
    Object.assign(container.style, { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 });
    document.body.appendChild(container);

    const icons = ['💖', '💕', '💗', '💓', '💝', '<i class="fa-solid fa-heart"></i>'];
    for (let i = 0; i < 7; i++) {
        setTimeout(() => {
            const h = document.createElement('div');
            h.className = 'floating-heart';
            h.innerHTML = icons[Math.floor(Math.random() * icons.length)];
            h.style.left = Math.random() * 100 + 'vw';
            h.style.fontSize = (Math.random() * 2 + 2) + 'rem';
            container.appendChild(h);
            setTimeout(() => h.remove(), 10000);
        }, i * 200);
    }
}

function initQRTabs() {
    const tabs = document.querySelectorAll('.qr-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-target');
            document.querySelectorAll('.qr-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.qr-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`qr-${target}`)?.classList.add('active');
        });
    });
}

function setupCountdown() {
    const timer = setInterval(() => {
        const distance = weddingDate - new Date().getTime();
        const isPast = distance < 0;
        const d = Math.abs(distance);
        const days = Math.floor(d / 86400000);
        const hrs = Math.floor((d % 86400000) / 3600000);
        const mins = Math.floor((d % 3600000) / 60000);
        const secs = Math.floor((d % 60000) / 1000);

        document.getElementById("days").innerText = toKhmerNumbers(isPast ? Math.floor(days/365) : days);
        document.getElementById("hours").innerText = toKhmerNumbers(isPast ? Math.floor((days%365)/30) : hrs);
        document.getElementById("minutes").innerText = toKhmerNumbers(isPast ? (days%30) : mins);
        if(!isPast) document.getElementById("seconds").innerText = toKhmerNumbers(secs);
        else document.getElementById("seconds").parentElement.style.display = 'none';
        
        const title = document.querySelector('.countdown-section h4');
        if (title) title.innerText = isPast ? "បានរៀបបង្គលការរួច" : "រាប់ថយក្រោយ";
    }, 1000);
}

function setupAudioListeners() {
    const audioBtn = document.getElementById('audio-toggle');
    if (audioBtn) {
        audioBtn.addEventListener('click', () => {
            if (!bgMusic) return;
            isMusicPlaying ? bgMusic.pause() : bgMusic.play();
            isMusicPlaying = !isMusicPlaying;
            audioBtn.style.animationPlayState = isMusicPlaying ? 'running' : 'paused';
            audioBtn.innerHTML = `<i class="fas fa-${isMusicPlaying ? 'music' : 'volume-mute'}"></i>`;
        });
    }
}

function setupScrollAnimations() {
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.scroll-animate, .animate-left, .animate-right, .animate-scale').forEach(el => obs.observe(el));
}

// ===== UTILS & SHARED =====
function toKhmerNumbers(n) {
    const kh = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
    return n.toString().split('').map(d => kh[d] || d).join('');
}

function trackLaunch(name = null) {
    if (!WebApp || sessionStorage.getItem('isAppTracked')) return;
    sessionStorage.setItem('isAppTracked', '1');
    fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: WebApp.initDataUnsafe?.user, guestName: name })
    }).catch(() => {});
}

function createFallingPetals() {
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const p = document.createElement('div');
            p.className = 'falling-petal';
            p.innerHTML = '<i class="fa-solid fa-heart"></i>';
            p.style.left = Math.random() * 100 + 'vw';
            p.style.animationDuration = (Math.random() * 10 + 10) + 's';
            document.body.appendChild(p);
            setTimeout(() => p.remove(), 20000);
        }, Math.random() * 10000);
    }
}

// Click Burst
document.addEventListener('click', (e) => {
    if (e.target.closest('button, a, .floating-heart')) return;
    const rib = document.createElement('div');
    rib.className = 'click-ripple';
    rib.style.left = e.clientX + 'px'; rib.style.top = e.clientY + 'px';
    document.body.appendChild(rib);
    setTimeout(() => rib.remove(), 1000);
});

// Final cleanup: Keyboard & swipe
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') changeLightbox(-1);
    if (e.key === 'ArrowRight') changeLightbox(1);
});

// Lightbox background click
document.getElementById('lightbox')?.addEventListener('click', e => {
    if (e.target.classList.contains('lightbox-overlay')) closeLightbox();
});

// --- Wish Envelopes ---
let envelopesStarted = false;
function startEnvelopes() {
    if (envelopesStarted) return;
    envelopesStarted = true;
    sessionStorage.setItem('inviteOpened', '1');
    setInterval(() => {
        createFloatingWish('ឈុន & ម៉ីលិញ', 'អរគុណដែលបានចូលរួមអបអរសាទរ! 💖');
    }, 15000);
}

function createFloatingWish(name, msg) {
    const w = document.createElement('div');
    w.className = 'floating-wish';
    w.innerHTML = `<div class="wish-icon">💌</div><div class="wish-text">${msg}</div><div class="wish-author">${name}</div>`;
    w.style.left = (Math.random() * 70 + 10) + 'vw';
    document.body.appendChild(w);
    w.onclick = () => w.remove();
    setTimeout(() => w.remove(), 30000);
}

function initCalendar() {
    document.getElementById('add-calendar-btn')?.addEventListener('click', () => {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
            const url = new URL('invite.ics', window.location.href).href;
            WebApp ? WebApp.openLink(url) : window.location.href = url;
        } else {
            const gCal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("សិរីមង្គលអាពាហ៍ពិពាហ៍ ឈុន & ម៉ីលិញ")}&dates=20260425T100000Z/20260425T140000Z`;
            WebApp ? WebApp.openLink(gCal) : window.open(gCal, '_blank');
        }
    });
}
