// Initialize Telegram Web App
const WebApp = window.Telegram?.WebApp;
if (WebApp) {
    WebApp.ready();
    WebApp.expand();
    // Configure WebApp
    WebApp.enableClosingConfirmation();
    WebApp.setHeaderColor('secondary_bg_color');
}

// Function to track app launch securely via Vercel API
function trackLaunch(guestName = null) {
    if (!WebApp) return;
    const userData = WebApp.initDataUnsafe?.user;

    // Track only once per session
    if (sessionStorage.getItem('isAppTracked')) return;
    sessionStorage.setItem('isAppTracked', '1');

    fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user: userData,
            guestName: guestName
        })
    }).catch(err => console.error("Tracking error:", err));
}

// Set the date we're counting down to
const weddingDate = new Date("Apr 25, 2026 00:00:00").getTime();

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
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        if (img) {
            // Function to reveal image once fully loaded or decoded
            const revealImage = () => {
                img.classList.add('loaded');
                item.classList.add('loaded'); // Stop shimmer on the parent too
            };

            if (img.complete) {
                revealImage();
            } else {
                img.addEventListener('load', revealImage);
                // Also handle errors gracefully
                img.addEventListener('error', () => {
                    item.classList.add('loaded'); // Stop shimmer even if error
                });
            }

            galleryImages.push(img.getAttribute('src'));
            item.onclick = (e) => {
                e.preventDefault();
                openLightbox(index);
            };
        }
    });

    // Gallery Show More Functionality
    const showMoreBtn = document.getElementById('show-more-btn');
    if (showMoreBtn) {
        // Initial state: hide items after the 11th (0-10 shown)
        let occupiedSpots = 0;
        const maxSpots = 10;

        galleryItems.forEach((item, index) => {
            const img = item.querySelector('img');
            if (img) {
                // Restore the background image for background:inherit compatibility
                item.style.backgroundImage = `url(${img.src})`;
            }

            let isWide = item.classList.contains('gallery-wide');

            // --- NEW: Better Gap Filling Logic ---
            const nextItem = galleryItems[index + 1];
            const nextIsWide = nextItem && nextItem.classList.contains('gallery-wide');

            // If this item starts a new row but the NEXT one is wide, 
            // this item will be alone. Make it wide to fill the row.
            if (!isWide && (occupiedSpots % 2 === 0) && nextIsWide) {
                item.classList.add('gallery-wide');
                isWide = true;
            }

            // If this is the last visible item and it's starting a new row, 
            // make it wide to avoid an empty space on the right.
            if (!isWide && (occupiedSpots % 2 === 0) && (index === galleryItems.length - 1 || occupiedSpots === maxSpots - 1)) {
                item.classList.add('gallery-wide');
                isWide = true;
            }

            const itemSpots = isWide ? 2 : 1;

            if (occupiedSpots + itemSpots <= maxSpots) {
                occupiedSpots += itemSpots;
            } else {
                // DON'T use display: none; visibility: hidden allows background pre-loading!
                item.classList.add('gallery-extra');
                // We'll handle pre-loading these in the background
            }
        });

        // Background Pre-loading Technique: 
        // Force the browser to fetch images in the background so the 'Show More' is instant.
        const preloadGalleryImages = () => {
            const extras = document.querySelectorAll('.gallery-extra img');
            extras.forEach((img, i) => {
                // Staggered fetch into browser cache using Image object
                // This works even if the DOM element is 'display: none'
                setTimeout(() => {
                    const preloadImg = new Image();
                    preloadImg.src = img.src;
                }, 500 + (i * 100)); // Start after 500ms, then 100ms apart
            });
        };

        // Run pre-loading after the first interaction or after a short idle delay
        let preloaded = false;
        const triggerPreload = () => {
            if (preloaded) return;
            preloaded = true;
            preloadGalleryImages();
            window.removeEventListener('scroll', triggerPreload);
            window.removeEventListener('touchstart', triggerPreload);
        };

        // Aggressive but polite trigger: Idle callback, 3s timeout, or first interaction
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => triggerPreload());
        }
        setTimeout(triggerPreload, 3000);
        window.addEventListener('scroll', triggerPreload, { passive: true });
        window.addEventListener('touchstart', triggerPreload, { passive: true });

        showMoreBtn.addEventListener('click', () => {
            const hiddenExtras = Array.from(document.querySelectorAll('.gallery-extra')).filter(el => !el.classList.contains('show'));
            const imagesToShow = 15;

            // Only show the next 15 hidden items
            for (let i = 0; i < imagesToShow && i < hiddenExtras.length; i++) {
                const item = hiddenExtras[i];
                item.classList.add('show');
                
                // Remove lazy loading since we want them to show immediately from cache
                const img = item.querySelector('img');
                if (img) img.removeAttribute('loading');

                // Subtle delay for staggered loading feel (60ms for more 'premium' reveal)
                setTimeout(() => {
                    item.classList.add('visible');
                }, i * 60);
            }

            // Check if there are any hidden extras remaining
            const remaining = Array.from(document.querySelectorAll('.gallery-extra')).filter(el => !el.classList.contains('show'));
            if (remaining.length === 0) {
                // All photos are out! Fade out the button
                showMoreBtn.parentElement.style.opacity = '0';
                setTimeout(() => {
                    showMoreBtn.parentElement.style.display = 'none';
                }, 400);
            } else {
                // Update button text to show remaining count if desired? 
                // Let's keep it simple for now as requested.
            }
        });
    }
});

let thumbnailsBuilt = false;

function buildThumbnails() {
    if (thumbnailsBuilt) return; // DON'T REBUILD IF ALREADY IN DOM
    const container = document.getElementById('lightbox-thumbnails');
    if (!container) return;

    // Efficiently batch the DOM appends
    const fragment = document.createDocumentFragment();
    galleryImages.forEach((src, i) => {
        const thumb = document.createElement('img');
        thumb.src = src;
        thumb.loading = 'lazy'; // Performance win!
        thumb.decoding = 'async';
        thumb.className = 'lightbox-thumb' + (i === currentLightboxIndex ? ' active' : '');
        thumb.onclick = (e) => {
            e.stopPropagation();
            goToLightbox(i);
        };
        fragment.appendChild(thumb);
    });
    container.appendChild(fragment);
    thumbnailsBuilt = true;
}

function updateLightbox() {
    const img = document.getElementById('lightbox-img');
    const counter = document.getElementById('lightbox-counter');
    if (img) {
        img.src = galleryImages[currentLightboxIndex];
        img.decoding = 'async'; // Super smooth decoding
    }
    if (counter) counter.textContent = `${currentLightboxIndex + 1} / ${galleryImages.length}`;

    // Update active thumbnail and auto-scroll it into view
    const thumbs = document.querySelectorAll('.lightbox-thumb');
    thumbs.forEach((t, i) => {
        const isActive = (i === currentLightboxIndex);
        t.classList.toggle('active', isActive);
        if (isActive) {
            t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    });
}

function openLightbox(index) {
    currentLightboxIndex = index;
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Build them only once in background
        if (!thumbnailsBuilt) buildThumbnails();

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
                    trackLaunch(foundName);
                } else {
                    trackLaunch(); // Fallback tracking
                }
            })
            .catch(error => {
                console.error('Error loading guest list:', error);
                trackLaunch(); // Fallback tracking if fetch fails
                if (window.location.protocol === 'file:') {
                    alert("Guest Name Feature requires a local server due to browser security.\nPlease use: http://localhost:8000/index.html?guest=" + guestId);
                }
            });
    } else if (WebApp && WebApp.initDataUnsafe && WebApp.initDataUnsafe.user) {
        const user = WebApp.initDataUnsafe.user;
        const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
        if (fullName) {
            updateGuestUI(fullName);
            trackLaunch(fullName);
        } else {
            trackLaunch();
        }
    } else {
        // Just track anonymous launch if nothing else
        trackLaunch();
    }
});

// Interactive Click Burst (Ripple & Magic)
document.addEventListener('click', function (e) {
    if (e.target.closest('.floating-heart') || e.target.closest('button') || e.target.closest('a')) return;

    // 1. Create Ripple
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    document.body.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 1000);

    // 2. Create Burst Particles
    const numParticles = 8; // More particles for a richer effect
    const colors = ['#ff69b4', '#ff4d4d', '#EDD19C', '#ffffff'];
    const shapes = ['<i class="fa-solid fa-heart"></i>', '✨', '💖', '⭐'];

    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.classList.add('click-particle');

        // Randomly pick shape and color
        particle.innerHTML = shapes[Math.floor(Math.random() * shapes.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];

        const size = Math.random() * 1 + 0.6; // 0.6rem to 1.6rem
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 80 + 30; // 30px to 110px spread

        particle.style.left = e.clientX + 'px';
        particle.style.top = e.clientY + 'px';
        particle.style.fontSize = size + 'rem';
        particle.style.color = color;

        particle.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
        particle.style.setProperty('--ty', Math.sin(angle) * distance - 40 + 'px');
        particle.style.setProperty('--rot', (Math.random() * 360 - 180) + 'deg');

        document.body.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 1000);
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

// Floating Hearts on Load
document.addEventListener("DOMContentLoaded", function () {
    // 1. Initialize Cover Slideshow
    const slides = document.querySelectorAll('.cover-slide');
    let currentSlide = 0;

    if (slides.length > 1) {
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 5000); // Change image every 5 seconds
    }

    const numHearts = 7; // Reduced quantity for a cleaner look (around 5-8)
    const heartsContainer = document.createElement('div');
    heartsContainer.id = 'hearts-container';
    heartsContainer.style.position = 'fixed';
    heartsContainer.style.top = '0';
    heartsContainer.style.left = '0';
    heartsContainer.style.width = '100%';
    heartsContainer.style.height = '100%';
    heartsContainer.style.pointerEvents = 'none';
    heartsContainer.style.zIndex = '9999';
    document.body.appendChild(heartsContainer);

    for (let i = 0; i < numHearts; i++) {
        setTimeout(() => {
            const heartIcons = [
                '<i class="fa-solid fa-heart"></i>',
                '<i class="fa-regular fa-heart"></i>',
                '💖',
                '💕',
                '💗',
                '💓',
                '💝'
            ];
            const heartColors = ['#ff69b4', '#ff4d4d', '#ff99cc', '#fce4ec', '#ffb6c1', '#e04b8b'];

            const heart = document.createElement('div');
            heart.classList.add('floating-heart');

            let hintHtml = '';
            // ONLY show the hint explicitly on the very first heart
            if (i === 0) {
                hintHtml = `
                    <div style="position: absolute; right: -25px; bottom: -20px; font-size: 14px; background: rgba(224, 75, 139, 0.9); color: white; padding: 4px 10px; border-radius: 12px; white-space: nowrap; box-shadow: 0 2px 5px rgba(0,0,0,0.3); animation: pulseHint 1.5s infinite alternate; pointer-events: none;">
                        👆 សូមចុច (Tap)
                    </div>
                `;
            }

            // Purely visual gesture! No ugly text box!
            const iconStr = heartIcons[Math.floor(Math.random() * heartIcons.length)];
            heart.innerHTML = `
                <div style="position: relative; display: flex; align-items: center; justify-content: center; animation: attentionSeeker 3s infinite;">
                    <div>${iconStr}</div>
                    ${hintHtml}
                </div>
            `;

            heart.style.color = heartColors[Math.floor(Math.random() * heartColors.length)];
            heart.style.left = Math.random() * 100 + 'vw';
            heart.style.animationDuration = (Math.random() * 5 + 7) + 's'; // 7 to 12 seconds
            const remSize = Math.random() * 2.5 + 2.5;
            heart.style.fontSize = remSize + 'rem'; // 2.5rem to 5rem

            heart.addEventListener('click', function (e) {
                heart.innerHTML = '';
                heart.style.backgroundImage = "url('assets/CX7_7941.jpg')";
                heart.style.backgroundSize = "cover";
                heart.style.backgroundPosition = "center top";
                heart.style.width = (remSize * 40) + 'px'; // Expand slightly into image
                heart.style.height = (remSize * 40) + 'px';
                heart.style.color = "transparent"; // Hide any text/icon leftover just in case

                const heartSvgMask = "url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 512 512\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z\"/></svg>')";
                heart.style.webkitMaskImage = heartSvgMask;
                heart.style.webkitMaskPosition = "center";
                heart.style.webkitMaskRepeat = "no-repeat";
                heart.style.webkitMaskSize = "contain";
                heart.style.maskImage = heartSvgMask;
                heart.style.maskPosition = "center";
                heart.style.maskRepeat = "no-repeat";
                heart.style.maskSize = "contain";
            });

            heartsContainer.appendChild(heart);

            // Remove the heart from DOM after animation completes
            setTimeout(() => {
                heart.remove();
            }, 13000); // Wait enough for slowest heart
        }, i * 150); // Faster stagger
    }

    // Remove container after all hearts are done
    setTimeout(() => {
        heartsContainer.remove();
    }, numHearts * 150 + 13500);
});

// ==========================================
// NEW EFFECTS: Sparkles & Petals
// ==========================================

// 1. Sparkle Cursor Trail
document.addEventListener('mousemove', function (e) {
    if (Math.random() > 0.4) return; // Reduce density so it's not overwhelming
    createSparkle(e.clientX, e.clientY);
});

document.addEventListener('touchmove', function (e) {
    if (Math.random() > 0.3) return; // Reduce density for touch
    const touch = e.touches[0];
    createSparkle(touch.clientX, touch.clientY);
}, { passive: true });

function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.className = 'cursor-sparkle';
    sparkle.innerHTML = '✨';
    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';
    sparkle.style.fontSize = (Math.random() * 0.8 + 0.4) + 'rem';
    sparkle.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's';

    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 1000);
}

// 2. Elegant Falling Hearts (Depth of Field Effect)
function createFallingPetals() {
    const numPetals = 25; // More petals for a fuller effect
    for (let i = 0; i < numPetals; i++) {
        setTimeout(spawnPetal, Math.random() * 8000);
    }
}

function spawnPetal() {
    const petal = document.createElement('div');
    petal.className = 'falling-petal';
    // Elegant soft hearts instead of emojis
    petal.innerHTML = '<i class="fa-solid fa-heart"></i>';

    // Randomize starting position horizontally
    petal.style.left = Math.random() * 100 + 'vw';

    // Vary size between tiny and small
    const size = Math.random() * 0.6 + 0.4;
    petal.style.fontSize = size + 'rem';

    // Elegant colors: Soft whites, pinks, champagnes
    const colors = ['rgba(255,255,255,0.8)', 'rgba(255,182,193,0.7)', 'rgba(250,230,234,0.8)', 'rgba(237,209,156,0.6)'];
    petal.style.color = colors[Math.floor(Math.random() * colors.length)];

    // Random CSS vars for dynamic sway and rotation
    petal.style.setProperty('--sway', (Math.random() * 30 - 15) + 'vw');
    petal.style.setProperty('--rotX', (Math.random() * 360 + 180) + 'deg');

    // Varying blur for out-of-focus dreamy look
    if (Math.random() > 0.4) {
        petal.style.filter = `blur(${Math.random() * 2.5}px)`;
    }

    // Randomize animation duration
    const duration = Math.random() * 10 + 10; // 10s to 20s to fall gently
    petal.style.animationDuration = duration + 's';

    document.body.appendChild(petal);

    // Remove petal after it falls, and respawn a new one
    setTimeout(() => {
        if (document.body.contains(petal)) {
            petal.remove();
            spawnPetal();
        }
    }, duration * 1000);
}

// Start falling petals along with everything else
document.addEventListener("DOMContentLoaded", function () {
    createFallingPetals();
});

// ==========================================
// NEW FEATURE: Add to Calendar (OS Detection)
// ==========================================
const addCalendarBtn = document.getElementById('add-calendar-btn');
if (addCalendarBtn) {
    addCalendarBtn.addEventListener('click', () => {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

        if (isIOS) {
            // Apple Devices rely entirely on .ics files for Apple Calendar
            // Instead of generating a blob (which Telegram blocks), we link to the actual invite.ics file!
            const icsUrl = new URL('invite.ics', window.location.href).href;

            if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
                window.Telegram.WebApp.openLink(icsUrl);
            } else {
                window.location.href = icsUrl;
            }
        } else {
            // Android and Desktop devices handle Google Calendar web links perfectly
            const eventTitle = encodeURIComponent("សិរីមង្គលអាពាហ៍ពិពាហ៍ ឈុន & ម៉ីលិញ");
            const location = encodeURIComponent("គេហដ្ឋានខាងស្រី ភូមិថ្មី ឃុំលើកដែក ស្រុកកោះធំ ខេត្តកណ្តាល");
            const details = encodeURIComponent("យើងខ្ញុំពិតជាមានក្តីសោមនស្សរីករាយក្រៃលែងក្នុងការអបអរសាទរថ្ងៃដ៏ពិសេសនេះជាមួយអ្នក! សូមគោរពអញ្ជើញចូលរួមជាភ្ញៀវកិត្តិយស។");

            // UTC times: 2026-04-25 17:00 ICT is 10:00 UTC, 21:00 ICT is 14:00 UTC
            const startDate = "20260425T100000Z";
            const endDate = "20260425T140000Z";

            const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&dates=${startDate}/${endDate}&details=${details}&location=${location}&text=${eventTitle}`;

            if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
                window.Telegram.WebApp.openLink(googleCalendarUrl);
            } else {
                window.open(googleCalendarUrl, '_blank');
            }
        }
    });
}

// ==========================================
// NEW BACKGROUND EFFECT: Floating Wish Cards
// ==========================================
let envelopesStarted = false;
let envelopesSpawnedCount = 0;

function startEnvelopes() {
    if (envelopesStarted) return;
    envelopesStarted = true;

    const predefinedWishes = [
        { name: 'ឈុន & ម៉ីលិញ', message: 'យើងរង់ចាំអបអរសាទរថ្ងៃដ៏អស្ចារ្យនេះជាមួយអ្នក! 💖' },
        { name: 'ឈុន & ម៉ីលិញ', message: 'អរគុណដែលបានចូលរួមអបអរសាទរថ្ងៃពិសេសរបស់ពួកយើង។' },
        { name: 'ឈុន & ម៉ីលិញ', message: 'វត្តមានរបស់អ្នកគឺមានន័យខ្លាំងណាស់សម្រាប់យើង! ✨' },
        { name: 'ឈុន & ម៉ីលិញ', message: 'វត្តមានរបស់អ្នកគឺជាកិត្តិយសដ៏ធំបំផុតសម្រាប់ពួកយើង។' },
        { name: 'ឈុន & ម៉ីលិញ', message: 'អរគុណដែលបានក្លាយជាចំណែករឿងរ៉ាវនៃស្នេហារបស់យើង! 🥂' },
        { name: 'ឈុន & ម៉ីលិញ', message: 'សូមជូនពរអ្នកជួបតែសេចក្តីសុខ និងសុភមង្គល។' }
    ];

    // Spawn the first envelope immediately
    if (envelopesSpawnedCount < 3) {
        const firstWish = predefinedWishes[Math.floor(Math.random() * predefinedWishes.length)];
        createFloatingWish(firstWish.name, firstWish.message, true);
        envelopesSpawnedCount++;
    }

    const envelopeInterval = setInterval(() => {
        if (envelopesSpawnedCount >= 3) {
            clearInterval(envelopeInterval);
            return;
        }

        // Only a 40% chance to spawn one every 12 seconds
        if (Math.random() > 0.4) return;

        const randomWish = predefinedWishes[Math.floor(Math.random() * predefinedWishes.length)];
        createFloatingWish(randomWish.name, randomWish.message, false);
        envelopesSpawnedCount++;

        if (envelopesSpawnedCount >= 3) {
            clearInterval(envelopeInterval);
        }
    }, 12000);
}

document.addEventListener("DOMContentLoaded", function () {
    // Check if the user already clicked "Open" previously in this session
    if (sessionStorage.getItem('inviteOpened') === '1') {
        startEnvelopes();
    }

    // Add logic to start envelopes IMMEDIATELY AFTER the user opens the card
    const openInviteBtn = document.querySelector('.open-invite-btn');
    if (openInviteBtn) {
        openInviteBtn.addEventListener('click', () => {
            // Start envelopes right away when they click "Open Invite"
            startEnvelopes();
        });
    }
});

function createFloatingWish(name, message, isFirst = false) {
    const wishEl = document.createElement('div');
    wishEl.className = 'floating-wish';

    // Add balloon/envelope icon (removed bird emoji)
    const icons = ['🎈', '💌', '💝', '💖'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];

    let hintHtml = '';
    // ONLY show the text hint explicitly on the very first envelope
    if (isFirst) {
        hintHtml = `
            <div style="margin-top: 15px; font-size: 13px; font-family: var(--khmer-body-font); background: #fce4ec; border: 1px dashed var(--deep-pink); color: #888; padding: 4px 12px; border-radius: 12px; white-space: nowrap; animation: pulseHint 1.5s infinite alternate; pointer-events: none;">
                👆 សូមចុច និងទាញលេង
            </div>
        `;
    }

    wishEl.innerHTML = `
        <div class="wish-icon attention-wiggle">
            ${randomIcon}
        </div>
        <div class="wish-text">"${message}"</div>
        <div class="wish-author">ពី៖ ${name}</div>
        ${hintHtml}
    `;

    // Keep it entirely on screen regardless of phone width (180px is approx width)
    const maxLeft = window.innerWidth > 220 ? window.innerWidth - 200 : 10;
    wishEl.style.left = (Math.random() * maxLeft + 10) + 'px';

    // First envelope floats faster to catch attention (e.g., 8 to 12s). 
    // Later background envelopes stay dreamy and slow (25 to 35s)
    const floatTime = isFirst ? (Math.random() * 4 + 8) : (Math.random() * 10 + 25);
    wishEl.style.animationDuration = floatTime + 's';

    // Interactive drag and pop logic
    let isDragging = false;
    let hasMoved = false;
    let startX = 0, startY = 0;
    let initialLeft = 0, initialTop = 0;

    const startDrag = (x, y) => {
        if (wishEl.dataset.dismissed) return;
        isDragging = true;
        hasMoved = false;
        startX = x;
        startY = y;

        const rect = wishEl.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;

        // Freeze float animation to follow finger/mouse
        wishEl.style.animation = 'none';
        wishEl.style.bottom = 'auto'; // Remove bottom pinning
        wishEl.style.left = initialLeft + 'px';
        wishEl.style.top = initialTop + 'px';

        wishEl.style.transition = 'none'; // Instant follow
        wishEl.style.transform = 'scale(1.05)'; // Slight lift effect when grabbed
        wishEl.style.zIndex = '1000000'; // Bring to front
    };

    const doDrag = (x, y) => {
        if (!isDragging) return;

        const dx = x - startX;
        const dy = y - startY;

        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            hasMoved = true;
        }

        wishEl.style.left = (initialLeft + dx) + 'px';
        wishEl.style.top = (initialTop + dy) + 'px';
    };

    const endDrag = () => {
        if (!isDragging) return;
        isDragging = false;

        wishEl.style.transform = 'scale(1)';
        wishEl.style.transition = 'transform 0.4s ease, opacity 0.4s ease'; // restore

        if (!hasMoved) {
            // Tap without drag -> POP!
            popWish();
        } else {
            // Let it fall down smoothly acting like you dropped a physical card
            wishEl.style.transition = 'top 1.5s cubic-bezier(0.5, 0, 1, 0.5), opacity 1.5s ease-in';
            wishEl.style.top = (window.innerHeight + 200) + 'px';
            wishEl.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(wishEl)) wishEl.remove();
            }, 1500);
        }
    };

    const popWish = () => {
        if (wishEl.dataset.dismissed) return;
        wishEl.dataset.dismissed = "true";

        let rect = wishEl.getBoundingClientRect();

        // Fast pop transform
        wishEl.style.transform = 'scale(1.4)';
        wishEl.style.opacity = '0';

        // Create 6 magic burst particles
        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
            particle.className = 'click-particle';
            particle.innerHTML = '✨';
            particle.style.left = (rect.left + rect.width / 2) + 'px';
            particle.style.top = (rect.top) + 'px';
            particle.style.color = '#e04b8b';
            particle.style.fontSize = '1.8rem';
            const angle = (Math.PI * 2 / 6) * i;
            const distance = 80;
            particle.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
            particle.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
            particle.style.setProperty('--rot', (Math.random() * 360) + 'deg');
            document.body.appendChild(particle);
            setTimeout(() => { if (document.body.contains(particle)) particle.remove(); }, 1000);
        }

        setTimeout(() => {
            if (document.body.contains(wishEl)) wishEl.remove();
        }, 400);
    };

    // Attach listeners
    wishEl.addEventListener('mousedown', e => startDrag(e.clientX, e.clientY));
    wishEl.addEventListener('touchstart', e => startDrag(e.touches[0].clientX, e.touches[0].clientY), { passive: true });

    // We must catch move/up on the window so if the mouse/finger moves fast it doesn't lose the element
    const onMove = (e) => {
        if (isDragging) {
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            doDrag(clientX, clientY);
        }
    };
    const onEnd = () => endDrag();

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);

    document.body.appendChild(wishEl);

    setTimeout(() => {
        if (document.body.contains(wishEl)) {
            wishEl.remove();
        }
    }, floatTime * 1000);
}

// ==========================================
// SECURITY: Disable Copy, Cut, and Right-Clicking
// ==========================================
document.addEventListener('contextmenu', function (e) {
    // Only allow context menu if they happen to be in an input field (none on this site currently)
    if (!e.target.closest('input') && !e.target.closest('textarea')) {
        e.preventDefault();
    }
});

document.addEventListener('copy', function (e) {
    e.preventDefault();
});

document.addEventListener('cut', function (e) {
    e.preventDefault();
});
