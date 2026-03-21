// Initialize Telegram Web App
const WebApp = window.Telegram?.WebApp;
if (WebApp) {
    WebApp.ready();
    WebApp.expand();
    // Configure WebApp
    WebApp.enableClosingConfirmation();
    WebApp.setHeaderColor('secondary_bg_color');
}

// Set the date we're counting down to
const weddingDate = new Date("Apr 25, 2026 17:00:00").getTime();

// Update the count down every 1 second
const countdownTimer = setInterval(function () {
    const now = new Date().getTime();
    const distanceOriginal = weddingDate - now;
    const isExpired = distanceOriginal < 0;
    const distance = Math.abs(distanceOriginal);

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const titleEl = document.querySelector('.countdown-section h4');

    if (isExpired) {
        if (titleEl) titleEl.innerText = "បានរៀបបង្គលការរួច";
        document.getElementById("days").parentElement.lastChild.textContent = " ឆ្នាំ";
        document.getElementById("hours").parentElement.lastChild.textContent = " ខែ";
        document.getElementById("minutes").parentElement.lastChild.textContent = " ថ្ងៃ";

        // Hide seconds when expired to match request or use as placeholder
        document.getElementById("seconds").parentElement.style.display = 'none';

        // For expired, we show simple Y M D logic - note: this is a rough approximation 
        // since 'distance' is just ms. For precise YMD we'd need Date diffing.
        // But following the requested layout:
        document.getElementById("days").innerText = toKhmerNumbers(Math.floor(days / 365));
        document.getElementById("hours").innerText = toKhmerNumbers(Math.floor((days % 365) / 30));
        document.getElementById("minutes").innerText = toKhmerNumbers(days % 30);
    } else {
        if (titleEl) titleEl.innerText = "រាប់ថយក្រោយ";
        document.getElementById("days").innerText = formatTime(days);
        document.getElementById("hours").innerText = formatTime(hours);
        document.getElementById("minutes").innerText = formatTime(minutes);
        document.getElementById("seconds").innerText = formatTime(seconds);
        document.getElementById("seconds").parentElement.style.display = 'block';
    }
}, 1000);

function toKhmerNumbers(num) {
    const khmerNumerals = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return num.toString().split('').map(digit => khmerNumerals[digit] || digit).join('');
}

function formatTime(time) {
    const padded = time < 10 ? `0${time}` : time.toString();
    return toKhmerNumbers(padded);
}

// Background Music
const bgMusic = document.getElementById('bg-music');
let isMusicPlaying = false;

// Try to auto-play, with fallback on ANY user interaction
function tryPlayMusic() {
    if (bgMusic && !isMusicPlaying) {
        bgMusic.volume = 0.5;
        bgMusic.play().then(() => {
            isMusicPlaying = true;
            updateAudioIcon();
            removePlayListeners();
        }).catch(() => { });
    }
}

// Listen for ANY user interaction to start music
const playEvents = ['click', 'touchstart', 'mousemove', 'scroll', 'keydown'];
function addPlayListeners() {
    playEvents.forEach(evt => document.addEventListener(evt, tryPlayMusic, { once: true }));
}
function removePlayListeners() {
    playEvents.forEach(evt => document.removeEventListener(evt, tryPlayMusic));
}

// Attempt autoplay immediately
tryPlayMusic();
// Also set up listeners as fallback
addPlayListeners();

// Start music when "បើកធៀប" button is clicked
function startMusic() {
    if (bgMusic) {
        bgMusic.volume = 0.5;
        bgMusic.play();
        isMusicPlaying = true;
        updateAudioIcon();
    }
}

// Audio toggle button
const audioBtn = document.getElementById('audio-toggle');
if (audioBtn) {
    audioBtn.addEventListener('click', () => {
        if (!bgMusic) return;
        if (isMusicPlaying) {
            bgMusic.pause();
            isMusicPlaying = false;
        } else {
            bgMusic.play();
            isMusicPlaying = true;
        }
        updateAudioIcon();
    });
}

function updateAudioIcon() {
    if (!audioBtn) return;
    if (isMusicPlaying) {
        audioBtn.style.animationPlayState = 'running';
        audioBtn.innerHTML = '<i class="fas fa-music"></i>';
    } else {
        audioBtn.style.animationPlayState = 'paused';
        audioBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    }
}

// Auto-pause when tab is hidden
let wasPlayingWhenHidden = false;
document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
        if (isMusicPlaying) {
            wasPlayingWhenHidden = true;
            bgMusic.pause();
            // We don't update isMusicPlaying state here to keep track that it "should" be playing
            // But visually we might want to show it's paused? 
            // Actually, if we set isMusicPlaying = false, audio icon stops spinning.
            // But we need to know to resume it.
            // Let's just pause the Audio element but keep our state logic simple.
            // Or better: update icon to paused but keep internal knowledge.
            audioBtn.style.animationPlayState = 'paused';
        } else {
            wasPlayingWhenHidden = false;
        }
    } else {
        if (wasPlayingWhenHidden) {
            bgMusic.play().catch(() => { });
            audioBtn.style.animationPlayState = 'running';
        }
    }
});

// Scroll Indicator
const scrollIndicator = document.querySelector('.scroll-indicator');
if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
        document.getElementById('invitation-card').scrollIntoView({
            behavior: 'smooth'
        });
    });
}

// Scroll Animations with Intersection Observer
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Add staggered delay for event items
            if (entry.target.classList.contains('event-item')) {
                const siblings = Array.from(entry.target.parentElement.children);
                const index = siblings.indexOf(entry.target);
                entry.target.style.transitionDelay = `${index * 0.1}s`;
            }
            entry.target.classList.add('visible');
            scrollObserver.unobserve(entry.target); // Only animate once
        }
    });
}, observerOptions);

// Observe all animated elements
document.querySelectorAll('.scroll-animate, .animate-left, .animate-right, .animate-scale').forEach(el => {
    scrollObserver.observe(el);
});

// ===== Lightbox Gallery =====
let galleryImages = [];
let currentLightboxIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    // Automatically find all images added to the gallery HTML
    document.querySelectorAll('.gallery-item img').forEach(img => {
        galleryImages.push(img.getAttribute('src'));
    });
});

// Build thumbnails
function buildThumbnails() {
    const container = document.getElementById('lightbox-thumbnails');
    if (!container) return;
    container.innerHTML = '';
    galleryImages.forEach((src, i) => {
        const thumb = document.createElement('img');
        thumb.src = src;
        thumb.className = 'lightbox-thumb' + (i === currentLightboxIndex ? ' active' : '');
        thumb.onclick = () => goToLightbox(i);
        container.appendChild(thumb);
    });
}

function updateLightbox() {
    const img = document.getElementById('lightbox-img');
    const counter = document.getElementById('lightbox-counter');
    if (img) img.src = galleryImages[currentLightboxIndex];
    if (counter) counter.textContent = `${currentLightboxIndex + 1} / ${galleryImages.length}`;
    // Update active thumbnail
    document.querySelectorAll('.lightbox-thumb').forEach((t, i) => {
        t.classList.toggle('active', i === currentLightboxIndex);
    });
}

function openLightbox(index) {
    currentLightboxIndex = index;
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        buildThumbnails();
        updateLightbox();
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function changeLightbox(direction) {
    currentLightboxIndex += direction;
    if (currentLightboxIndex < 0) currentLightboxIndex = galleryImages.length - 1;
    if (currentLightboxIndex >= galleryImages.length) currentLightboxIndex = 0;
    updateLightbox();
}

function goToLightbox(index) {
    currentLightboxIndex = index;
    updateLightbox();
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') changeLightbox(-1);
    if (e.key === 'ArrowRight') changeLightbox(1);
});

// Close lightbox when clicking overlay background
document.getElementById('lightbox')?.addEventListener('click', (e) => {
    if (e.target.classList.contains('lightbox-overlay')) closeLightbox();
});

// Swipe support for mobile
let touchStartX = 0;
document.getElementById('lightbox')?.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});
document.getElementById('lightbox')?.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
        changeLightbox(diff > 0 ? 1 : -1);
    }
});

// Guest Name Loader
document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const guestId = urlParams.get('guest');

    const updateGuestUI = (name) => {
        const guestEl = document.querySelector('.guest-name');
        if (guestEl) {
            guestEl.textContent = name;
            guestEl.style.transition = "color 1s ease";
            guestEl.style.color = "var(--gold-text)";
        }
    };

    if (guestId) {
        // Use encodeURIComponent just in case, though 'guest list.csv' is usually handle by browser encoding
        fetch('guest%20list.csv')
            .then(response => {
                if (!response.ok) throw new Error("Network response was not ok");
                return response.text();
            })
            .then(data => {
                const rows = data.split('\n');
                let foundName = null;

                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i].trim();
                    if (!row) continue;

                    // Safe split by first comma
                    const firstCommaIndex = row.indexOf(',');
                    if (firstCommaIndex === -1) continue;

                    const id = row.substring(0, firstCommaIndex).trim();
                    // Check if ID matches
                    if (id == guestId) {
                        foundName = row.substring(firstCommaIndex + 1).trim();
                        // Check for quotes
                        if (foundName.startsWith('"') && foundName.endsWith('"')) {
                            foundName = foundName.slice(1, -1);
                        }
                        foundName = foundName.replace(/""/g, '"');
                        break;
                    }
                }

                if (foundName) {
                    updateGuestUI(foundName);
                }
            })
            .catch(error => {
                console.error('Error loading guest list:', error);
                if (window.location.protocol === 'file:') {
                    alert("Guest Name Feature requires a local server due to browser security.\nPlease use: http://localhost:8000/index.html?guest=" + guestId);
                }
            });
    } else if (WebApp && WebApp.initDataUnsafe && WebApp.initDataUnsafe.user) {
        const user = WebApp.initDataUnsafe.user;
        const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
        if (fullName) {
            updateGuestUI(fullName);
        }
    }
});



/* --- Back to Top Button Logic --- */
const backToTopBtn = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
    // Show only when user is near the bottom (within 100px)
    const isAtBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 100);

    if (isAtBottom) {
        if (backToTopBtn) backToTopBtn.classList.add('show');
    } else {
        if (backToTopBtn) backToTopBtn.classList.remove('show');
    }
});

if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// QR Code Tab Switching
document.addEventListener('DOMContentLoaded', () => {
    const qrTabs = document.querySelectorAll('.qr-tab');
    const qrContents = document.querySelectorAll('.qr-content');

    qrTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-target');

            // Update tabs
            qrTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update content
            qrContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `qr-${target}`) {
                    content.classList.add('active');
                }
            });
        });
    });
});
