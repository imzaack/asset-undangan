/**
 * Serat Ulem Pawiwahan Ageng
 * Mochamad Prasetyo & Oktaviana Rahmadhani
 * Interactive Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. URL Parameter Guest Name Parser
  initGuestName();

  // 2. Cover / Gate Opening & Music Playback
  initCoverGate();

  // 3. Audio Controller
  initAudioPlayer();

  // 4. Countdown Timer
  initCountdownTimer();

  // 5. Lightbox Gallery
  initLightbox();

  // 6. Guestbook & RSVP (with localStorage)
  initGuestbook();

  // 7. Copy to Clipboard
  initCopyClipboard();

  // 8. Petal / Jasmine Falling Effect (Canvas)
  initFallingPetals();

  // 9. Scroll Reveal Animations & Bottom Navigation Spy
  initScrollEffects();
});

/* ==========================================================================
   1. GUEST NAME PARSER (?to=Nama+Tamu)
   ========================================================================== */
function initGuestName() {
  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get('to') || urlParams.get('u') || urlParams.get('guest');
  const targetEl = document.getElementById('guestNameText');

  if (targetEl && guestName) {
    // Decode and sanitize
    const cleanName = decodeURIComponent(guestName.replace(/\+/g, ' ')).trim();
    targetEl.textContent = cleanName;
  }
}

/* ==========================================================================
   2. COVER GATE & INVITATION OPENING
   ========================================================================== */
function initCoverGate() {
  const openBtn = document.getElementById('btnOpenInvitation');
  const coverGate = document.getElementById('coverGate');
  const bottomNav = document.getElementById('bottomNav');
  const audio = document.getElementById('weddingAudio');

  if (!openBtn || !coverGate) return;

  openBtn.addEventListener('click', () => {
    // Slide away cover
    coverGate.classList.add('opened');
    document.body.classList.remove('locked');

    // Show floating navigation
    if (bottomNav) {
      setTimeout(() => {
        bottomNav.classList.add('visible');
      }, 600);
    }

    // Try playing audio on user interaction
    playWeddingMusic();

    // Trigger hero section reveal
    setTimeout(() => {
      document.querySelectorAll('#hero .reveal').forEach(el => el.classList.add('active'));
    }, 400);

    showToast('Sugeng Rawuh ing Pawiwahan Prasetyo & Oktaviana');
  });
}

/* ==========================================================================
   3. AUDIO CONTROLLER WITH SYNTHESIS FALLBACK
   ========================================================================== */
let isPlaying = false;
let audioContext = null;
let synthInterval = null;

function initAudioPlayer() {
  const toggleBtn = document.getElementById('musicToggleBtn');
  const audio = document.getElementById('weddingAudio');

  if (!toggleBtn || !audio) return;

  toggleBtn.addEventListener('click', () => {
    if (isPlaying) {
      pauseWeddingMusic();
    } else {
      playWeddingMusic();
    }
  });

  // Handle audio ends (loop)
  audio.addEventListener('ended', () => {
    audio.currentTime = 0;
    audio.play();
  });
}

function playWeddingMusic() {
  const audio = document.getElementById('weddingAudio');
  const toggleBtn = document.getElementById('musicToggleBtn');

  if (!audio) return;

  const playPromise = audio.play();

  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        isPlaying = true;
        if (toggleBtn) toggleBtn.classList.add('playing');
      })
      .catch((err) => {
        console.info('Audio asset not found or restricted. Starting harmonious Javanese melodic ambient fallback...', err);
        // Start soft peaceful pentatonic chime fallback so page always has music
        startJavaneseAmbientSynth();
        isPlaying = true;
        if (toggleBtn) toggleBtn.classList.add('playing');
      });
  }
}

function pauseWeddingMusic() {
  const audio = document.getElementById('weddingAudio');
  const toggleBtn = document.getElementById('musicToggleBtn');

  if (audio) {
    audio.pause();
  }
  stopJavaneseAmbientSynth();
  isPlaying = false;
  if (toggleBtn) toggleBtn.classList.remove('playing');
}

/**
 * Peaceful Javanese Slendro / Pelog Pentatonic chime fallback using Web Audio API
 * Activated automatically if user has not yet dropped their wedding-song.mp3 into assets/music/
 */
function startJavaneseAmbientSynth() {
  if (synthInterval) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!audioContext) audioContext = new AudioCtx();
    if (audioContext.state === 'suspended') audioContext.resume();

    // Gamelan Pelog / Slendro frequencies (Hz) for gentle chime
    const gamelanScale = [262, 294, 330, 392, 440, 523, 587, 659];
    let noteIdx = 0;

    synthInterval = setInterval(() => {
      if (!isPlaying) return;
      const freq = gamelanScale[Math.floor(Math.random() * gamelanScale.length)];
      playGamelanBell(freq);
    }, 1800);
  } catch (e) {
    console.warn('Web Audio not supported:', e);
  }
}

function stopJavaneseAmbientSynth() {
  if (synthInterval) {
    clearInterval(synthInterval);
    synthInterval = null;
  }
}

function playGamelanBell(freq) {
  if (!audioContext || audioContext.state === 'suspended') return;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, audioContext.currentTime);

  gain.gain.setValueAtTime(0.001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.04, audioContext.currentTime + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 2.4);

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.start();
  osc.stop(audioContext.currentTime + 2.5);
}

/* ==========================================================================
   4. COUNTDOWN TIMER
   ========================================================================== */
function initCountdownTimer() {
  // Target Wedding Date (e.g., 20 November 2026 08:00:00 WIB)
  const weddingDate = new Date('2026-11-20T08:00:00+07:00').getTime();

  const daysEl = document.getElementById('countDays');
  const hoursEl = document.getElementById('countHours');
  const minutesEl = document.getElementById('countMinutes');
  const secondsEl = document.getElementById('countSeconds');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  function update() {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance < 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   5. LIGHTBOX GALLERY
   ========================================================================== */
function initLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  const modal = document.getElementById('lightboxModal');
  const modalImg = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxClose');

  if (!modal || !modalImg) return;

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) {
        modalImg.src = img.src;
        modal.classList.add('active');
      }
    });
  });

  function closeModal() {
    modal.classList.remove('active');
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   6. GUESTBOOK & RSVP WITH LOCALSTORAGE
   ========================================================================== */
const DEFAULT_WISHES = [
  {
    name: 'Bima & Roro Kinasih',
    status: 'hadir',
    time: '2 jam yang lalu',
    message: 'Barakallahu lakuma wa baraka alaikuma wa jamaa bainakuma fii khoir. Selamat menempuh hidup baru mas Pras & mba Okta. Mugi dados keluarga ingkang sakinah mawaddah warahmah, langgeng dumugi kaken-kaken ninen-ninen.'
  },
  {
    name: 'Dimas Wicaksono',
    status: 'hadir',
    time: '4 jam yang lalu',
    message: 'Selamat Pras & Okta! Lancar sampai hari H. Semoga Allah limpahkan berkah dan kebahagiaan berlimpah untuk kalian berdua.'
  },
  {
    name: 'Anisa Laksmiati',
    status: 'ragu',
    time: '1 hari yang lalu',
    message: 'Happy wedding mbak Novi/Okta & mas Prasetyo! Nderek bingah sanget. Doa terbaik untuk rumah tangga kalian berdua.'
  }
];

function initGuestbook() {
  const form = document.getElementById('rsvpForm');
  const container = document.getElementById('wishesContainer');
  const storageKey = 'pras_okta_wedding_wishes';

  if (!container) return;

  // Load from LocalStorage or default
  let savedWishes = [];
  try {
    const raw = localStorage.getItem(storageKey);
    savedWishes = raw ? JSON.parse(raw) : DEFAULT_WISHES;
  } catch (e) {
    savedWishes = DEFAULT_WISHES;
  }

  function renderWishes() {
    container.innerHTML = '';
    savedWishes.forEach(item => {
      const card = document.createElement('div');
      card.className = 'wish-item';

      const isHadir = item.status === 'hadir';
      const badgeText = isHadir ? '✓ Hadir' : (item.status === 'ragu' ? '? Masih Ragu' : '✗ Berhalangan');
      const badgeClass = isHadir ? 'badge-hadir' : 'badge-absen';

      card.innerHTML = `
        <div class="wish-header">
          <span class="wish-author">${escapeHtml(item.name)}</span>
          <span class="wish-badge ${badgeClass}">${badgeText}</span>
        </div>
        <p class="wish-message">${escapeHtml(item.message)}</p>
        <span class="wish-time">${escapeHtml(item.time || 'Baru saja')}</span>
      `;
      container.appendChild(card);
    });
  }

  renderWishes();

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('rsvpName');
      const statusInput = document.getElementById('rsvpStatus');
      const messageInput = document.getElementById('rsvpMessage');

      const name = nameInput.value.trim();
      const status = statusInput.value;
      const message = messageInput.value.trim();

      if (!name || !message) {
        showToast('Mohon lengkapi nama dan doa restu panjenengan');
        return;
      }

      const newWish = {
        name,
        status,
        message,
        time: 'Baru saja'
      };

      savedWishes.unshift(newWish);
      try {
        localStorage.setItem(storageKey, JSON.stringify(savedWishes));
      } catch (err) {
        console.error(err);
      }

      renderWishes();
      form.reset();
      showToast('Matur nuwun sanget atas doa & ucapan panjenengan!');
    });
  }
}

function escapeHtml(string) {
  const div = document.createElement('div');
  div.textContent = string;
  return div.innerHTML;
}

/* ==========================================================================
   7. COPY TO CLIPBOARD
   ========================================================================== */
function initCopyClipboard() {
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (!textToCopy) return;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`Nomor rekening ${textToCopy} berhasil disalin!`);
        }).catch(() => fallbackCopy(textToCopy));
      } else {
        fallbackCopy(textToCopy);
      }
    });
  });
}

function fallbackCopy(text) {
  const tempInput = document.createElement('input');
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
  showToast(`Nomor rekening ${text} berhasil disalin!`);
}

function showToast(message) {
  let toast = document.getElementById('appToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'appToast';
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C5A059" stroke-width="2">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
    <span>${message}</span>
  `;
  toast.classList.add('show');

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

/* ==========================================================================
   8. FALLING JASMINE PETALS & GOLD SPARKLES
   ========================================================================== */
function initFallingPetals() {
  const canvas = document.getElementById('petalsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const petalsCount = 28;
  const petals = [];

  for (let i = 0; i < petalsCount; i++) {
    petals.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 7 + 5,
      speedX: Math.random() * 1 - 0.5,
      speedY: Math.random() * 1.2 + 0.6,
      rotation: Math.random() * 360,
      rotSpeed: Math.random() * 1.5 - 0.75,
      opacity: Math.random() * 0.5 + 0.3,
      isGold: Math.random() > 0.65 // Some are gold sparkles, some are ivory petals
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    petals.forEach(p => {
      p.y += p.speedY;
      p.x += Math.sin(p.y * 0.01) * 0.8 + p.speedX;
      p.rotation += p.rotSpeed;

      if (p.y > height) {
        p.y = -10;
        p.x = Math.random() * width;
      }
      if (p.x > width) p.x = 0;
      if (p.x < 0) p.x = width;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;

      if (p.isGold) {
        // Gold shimmer diamond
        ctx.fillStyle = '#D4AF37';
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 0.7);
        ctx.lineTo(p.size * 0.5, 0);
        ctx.lineTo(0, p.size * 0.7);
        ctx.lineTo(-p.size * 0.5, 0);
        ctx.closePath();
        ctx.fill();
      } else {
        // Soft Jasmine petal (oval curved)
        ctx.fillStyle = '#FFF8EE';
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 0.6, p.size, Math.PI / 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    });

    requestAnimationFrame(render);
  }

  render();
}

/* ==========================================================================
   9. SCROLL REVEAL & BOTTOM NAV SPY
   ========================================================================== */
function initScrollEffects() {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    },
    { threshold: 0.15 }
  );

  reveals.forEach(el => observer.observe(el));

  // Navigation spy
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.pageYOffset + 200;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}
