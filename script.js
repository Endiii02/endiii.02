// ===== GLOBAL STATE & CONFIG =====
const STATE = {
  initialized: false,
  musicPlaying: false,
  isMobile: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  isReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  pageHidden: false,
  scrollY: 0,
  mouseX: 0,
  mouseY: 0,
  cursorVisible: true
};

// ===== DOM ELEMENTS =====
const elements = {
  splashScreen: document.getElementById('splash-screen'),
  splashOverlay: document.getElementById('splash-overlay'),
  mainContent: document.querySelector('.main-content'),
  footer: document.querySelector('.footer'),
  music: document.getElementById('bg-music'),
  musicToggle: document.getElementById('musicToggle'),
  musicVisualizer: document.querySelector('.music-visualizer'),
  downloadBtn: document.getElementById('downloadBtn'),
  copyEmailBtn: document.getElementById('copyEmailBtn'),
  shareBtn: document.getElementById('shareBtn'),
  typing: document.getElementById('typing'),
  reveals: document.querySelectorAll('.reveal'),
  card: document.querySelector('.card'),
  toastContainer: document.getElementById('toast-container'),
  customCursor: document.getElementById('custom-cursor'),
  cursorDot: document.getElementById('cursor-dot'),
  cursorOutline: document.getElementById('cursor-outline')
};

// ===== CANVAS SETUP =====
const canvases = {
  star: document.getElementById('bg-canvas'),
  nebula: document.getElementById('nebula-canvas'),
  cloud: document.getElementById('cloud-canvas'),
  particle: document.getElementById('particle-canvas')
};

const contexts = {};
Object.keys(canvases).forEach(key => {
  if (canvases[key]) {
    contexts[key] = canvases[key].getContext('2d');
  }
});

// ===== PARTICLE SYSTEMS =====
const particles = {
  stars: [],
  nebula: [],
  clouds: [],
  interactive: []
};

const colors = [
  { r: 120, g: 80, b: 255 },
  { r: 80, g: 180, b: 255 },
  { r: 150, g: 50, b: 200 },
  { r: 110, g: 231, b: 183 },
  { r: 255, g: 107, b: 180 }
];

// ---------- Typing effect ----------
const typingTexts = [
  'Yêu thích lập trình💻👾',
  'Đam Mê Âm Nhạc & lập Trình Web',
  'Sống để học và tạo ra giá trị',
  'Âm Nhạc Mãi Mãi là Số 1 trong ❤️ tôi',
  'Tải Python 🐍 hay C++ để chơi được😉'
];

let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 60;
let deletingSpeed = 40;
let pauseTime = 2000;

const typEl = document.getElementById('typing');
const cursorEl = document.querySelector('.typing-cursor');

function typeWriter() {
  if (!typEl) return;
  
  const currentText = typingTexts[textIndex];
  
  if (isDeleting) {
    // Deleting characters
    typEl.textContent = currentText.substring(0, charIndex - 1);
    charIndex--;
    
    if (charIndex === 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % typingTexts.length;
      setTimeout(typeWriter, 500); // Pause before typing next text
      return;
    }
    
    setTimeout(typeWriter, deletingSpeed);
  } else {
    // Typing characters
    typEl.textContent = currentText.substring(0, charIndex + 1);
    charIndex++;
    
    if (charIndex === currentText.length) {
      isDeleting = true;
      setTimeout(typeWriter, pauseTime); // Pause before deleting
      return;
    }
    
    setTimeout(typeWriter, typingSpeed);
  }
}

// Start typing effect when page loads
window.addEventListener('load', () => {
  setTimeout(typeWriter, 1000);
});

// ===== INITIALIZATION =====
function init() {
  if (STATE.initialized) return;
  
  try {
    setupEventListeners();
    setupCanvas();
    initStars();
    initNebula();
    initClouds();
    initInteractiveParticles();
    setupCustomCursor();
    setupRevealAnimation();
    setupVanillaTilt();
    
    STATE.initialized = true;
    console.log('🚀 Portfolio initialized successfully!');
  } catch (error) {
    console.error('Initialization error:', error);
    showToast('Có lỗi xảy ra khi khởi tạo trang. Vui lòng tải lại!', 'error');
  }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  // Splash screen
  if (elements.splashScreen) {
    elements.splashScreen.addEventListener('click', handleSplashStart, { once: true });
  }

  // Music controls
  if (elements.musicToggle) {
    elements.musicToggle.addEventListener('click', toggleMusic);
  }

  // Action buttons
  if (elements.downloadBtn) {
    elements.downloadBtn.addEventListener('click', downloadHTML);
  }

  if (elements.copyEmailBtn) {
    elements.copyEmailBtn.addEventListener('click', copyEmail);
  }

  if (elements.shareBtn) {
    elements.shareBtn.addEventListener('click', sharePage);
  }

  // Page visibility
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Window resize
  window.addEventListener('resize', debounce(handleResize, 250));

  // Scroll events
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Mouse events for interactive particles
  if (!STATE.isMobile) {
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseenter', () => STATE.cursorVisible = true);
    document.addEventListener('mouseleave', () => STATE.cursorVisible = false);
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);

  // Prevent context menu on certain elements
  document.addEventListener('contextmenu', e => {
    if (e.target.closest('.card, .side')) {
      e.preventDefault();
    }
  });

  // Add ripple effect to social links
  document.querySelectorAll('.social-link').forEach(link => {
    link.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  // Mobile touch support for card-mini
  document.querySelectorAll('.card-mini').forEach(card => {
    // Touch start
    card.addEventListener('touchstart', function(e) {
      this.classList.add('touch-active');
    }, { passive: true });
    
    // Touch end
    card.addEventListener('touchend', function(e) {
      setTimeout(() => {
        this.classList.remove('touch-active');
      }, 300);
    }, { passive: true });
    
    // Touch cancel
    card.addEventListener('touchcancel', function(e) {
      this.classList.remove('touch-active');
    }, { passive: true });
    
    // Add haptic feedback on supported devices
    card.addEventListener('click', function(e) {
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    });
  });

  // Portfolio tabs functionality
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      
      // Remove active class from all buttons and panes
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      
      // Add active class to clicked button and corresponding pane
      btn.classList.add('active');
      document.getElementById(`${targetTab}-tab`).classList.add('active');
    });
  });

  // Music player functionality
  let isPlaying = false;
  let currentTrack = 0;
  const playBtn = document.querySelector('.play-btn');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  const progressFill = document.querySelector('.progress-fill');
  const currentTimeEl = document.querySelector('.current-time');
  const trackItems = document.querySelectorAll('.track-item');
  const playTrackBtns = document.querySelectorAll('.play-track-btn');

  // Simulated track data
  const tracks = [
    { title: 'Summer Vibes', artist: 'DJ Producer ENDiii', duration: '3:45' },
    { title: 'Night City', artist: 'DJ Producer ENDiii', duration: '4:20' },
    { title: 'Dream Catcher', artist: 'DJ Producer ENDiii', duration: '3:15' },
    { title: 'Electric Dreams', artist: 'DJ Producer ENDiii', duration: '5:10' }
  ];

  // Play/Pause functionality
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      const playIcon = isPlaying ? 
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>' :
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
      
      playBtn.innerHTML = playIcon;
      
      // Update track item active state
      trackItems.forEach((item, index) => {
        if (index === currentTrack) {
          item.classList.add('active');
          const btn = item.querySelector('.play-track-btn');
          btn.textContent = isPlaying ? '⏸️' : '▶️';
        } else {
          item.classList.remove('active');
          const btn = item.querySelector('.play-track-btn');
          btn.textContent = '▶️';
        }
      });
      
      // Simulate progress
      if (isPlaying) {
        simulateProgress();
      }
    });
  }

  // Previous track
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
      updateTrackInfo();
    });
  }

  // Next track
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentTrack = (currentTrack + 1) % tracks.length;
      updateTrackInfo();
    });
  }

  // Track item click
  trackItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      currentTrack = index;
      updateTrackInfo();
      if (!isPlaying) {
        playBtn.click();
      }
    });
  });

  // Play track button click
  playTrackBtns.forEach((btn, index) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentTrack = index;
      updateTrackInfo();
      playBtn.click();
    });
  });

  function updateTrackInfo() {
    const track = tracks[currentTrack];
    const trackTitle = document.querySelector('.track-title');
    const trackArtist = document.querySelector('.track-artist');
    const totalTime = document.querySelector('.total-time');
    
    if (trackTitle) trackTitle.textContent = track.title;
    if (trackArtist) trackArtist.textContent = track.artist;
    if (totalTime) totalTime.textContent = track.duration;
    
    // Reset progress
    if (progressFill) progressFill.style.width = '0%';
    if (currentTimeEl) currentTimeEl.textContent = '0:00';
    
    // Update active track
    trackItems.forEach((item, index) => {
      if (index === currentTrack) {
        item.classList.add('active');
        const btn = item.querySelector('.play-track-btn');
        btn.textContent = isPlaying ? '⏸️' : '▶️';
      } else {
        item.classList.remove('active');
        const btn = item.querySelector('.play-track-btn');
        btn.textContent = '▶️';
      }
    });
  }

  function simulateProgress() {
    let progress = 0;
    const interval = setInterval(() => {
      if (!isPlaying) {
        clearInterval(interval);
        return;
      }
      
      progress += 0.5;
      if (progressFill) progressFill.style.width = `${progress}%`;
      
      // Update current time
      const totalSeconds = 225; // 3:45 in seconds
      const currentSeconds = Math.floor((progress / 100) * totalSeconds);
      const minutes = Math.floor(currentSeconds / 60);
      const seconds = currentSeconds % 60;
      if (currentTimeEl) currentTimeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      if (progress >= 100) {
        clearInterval(interval);
        // Auto play next track
        nextBtn.click();
      }
    }, 100);
  }

  // Show portfolio section when page is scrolled
  function showPortfolioSection() {
    const portfolioSection = document.querySelector('.portfolio-section');
    if (portfolioSection) {
      const rect = portfolioSection.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.8) {
        portfolioSection.classList.add('visible');
      }
    }
  }

  window.addEventListener('scroll', showPortfolioSection);
  showPortfolioSection(); // Check on load

  // Magnetic button effect
  function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
      button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        const distance = Math.sqrt(x * x + y * y);
        const maxDistance = 100;
        
        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          const translateX = x * force * 0.3;
          const translateY = y * force * 0.3;
          
          button.style.transform = `translate(${translateX}px, ${translateY}px) scale(1.05)`;
        }
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.transform = '';
      });
    });
  }

  // Create card particles
  function createCardParticles() {
    const card = document.querySelector('.card');
    if (!card) return;
    
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'card-particles';
    card.appendChild(particlesContainer);
    
    // Create particles
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'card-particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 8 + 's';
      particle.style.animationDuration = (8 + Math.random() * 4) + 's';
      
      // Random color
      const colors = ['var(--accent-primary)', 'var(--accent-secondary)', 'var(--accent-tertiary)'];
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      
      particlesContainer.appendChild(particle);
    }
  }

  // Enhanced card tilt effect
  function enhanceCardTilt() {
    const card = document.querySelector('.card');
    if (!card) return;
    
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / centerY * 10;
      const rotateY = (centerX - x) / centerX * 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  }

  // Initialize enhanced animations
  setTimeout(() => {
    initMagneticButtons();
    createCardParticles();
    enhanceCardTilt();
    createCardMiniParticles();
  }, 2000); // Wait for card entrance animation

  // Create card mini particles
  function createCardMiniParticles() {
    const cardMinis = document.querySelectorAll('.card-mini');
    
    cardMinis.forEach(card => {
      const particlesContainer = document.createElement('div');
      particlesContainer.className = 'particles';
      card.appendChild(particlesContainer);
      
      // Create particles for each card mini
      for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (6 + Math.random() * 3) + 's';
        
        // Random color
        const colors = ['var(--accent-primary)', 'var(--accent-secondary)', 'var(--accent-tertiary)'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        particlesContainer.appendChild(particle);
      }
    });
  }

  // Contact form functionality
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', handleFormSubmit);
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    
    // Validate form
    if (!data.name || !data.email || !data.message) {
      showToast('Vui lòng điền đầy đủ thông tin bắt buộc!', 'error');
      return;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      showToast('Email không hợp lệ!', 'error');
      return;
    }
    
    // Simulate form submission
    const submitBtn = contactForm.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<span class="btn-icon">⏳</span><span>Đang gửi...</span>';
    submitBtn.disabled = true;
    
    setTimeout(() => {
      showToast('Tin nhắn đã được gửi thành công!', 'success');
      contactForm.reset();
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }, 2000);
  }

  // Copy button functionality
  const copyBtns = document.querySelectorAll('.copy-btn');
  copyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.dataset.copy;
      
      if (navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy)
          .then(() => {
            showToast('Đã sao chép vào clipboard!', 'success');
            updateCopyButton(btn);
          })
          .catch(() => {
            fallbackCopy(textToCopy);
            updateCopyButton(btn);
          });
      } else {
        fallbackCopy(textToCopy);
        updateCopyButton(btn);
      }
    });
  });

  function updateCopyButton(btn) {
    const originalText = btn.textContent;
    btn.textContent = '✅ Đã sao chép';
    btn.style.background = 'linear-gradient(135deg, var(--accent-tertiary), var(--accent-quaternary))';
    
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
    }, 2000);
  }

  function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      showToast('Đã sao chép vào clipboard!', 'success');
    } catch (error) {
      showToast('Không thể sao chép. Vui lòng thử lại!', 'error');
    }
    
    document.body.removeChild(textArea);
  }

  // Dark mode toggle functionality
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.querySelector('.theme-icon');
  const themeTooltip = document.querySelector('.theme-tooltip');
  
  // Check for saved theme preference or default to light mode
  const currentTheme = localStorage.getItem('theme') || 'light';
  if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeIcon.textContent = '☀️';
    themeTooltip.textContent = 'Light Mode';
  }
  
  themeToggle.addEventListener('click', () => {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    
    // Update icon and tooltip
    if (isDarkMode) {
      themeIcon.textContent = '☀️';
      themeTooltip.textContent = 'Light Mode';
      localStorage.setItem('theme', 'dark');
      showToast('Đã chuyển sang Dark Mode', 'success');
    } else {
      themeIcon.textContent = '🌙';
      themeTooltip.textContent = 'Dark Mode';
      localStorage.setItem('theme', 'light');
      showToast('Đã chuyển sang Light Mode', 'success');
    }
  });

  // Show sections on scroll
  function showSectionsOnScroll() {
    const sections = document.querySelectorAll('.contact-section, .testimonials-section, .portfolio-section, .blog-section, .newsletter-section');
    
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.8) {
        section.classList.add('visible');
      }
    });
  }

  window.addEventListener('scroll', showSectionsOnScroll);
  showSectionsOnScroll(); // Check on load

  // Blog category filter functionality
  const categoryBtns = document.querySelectorAll('.category-btn');
  const blogPosts = document.querySelectorAll('.blog-post');
  const featuredPosts = document.querySelectorAll('.featured-post');

  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      
      // Remove active class from all buttons
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Filter posts
      if (category === 'all') {
        blogPosts.forEach(post => post.style.display = 'block');
        featuredPosts.forEach(post => post.style.display = 'grid');
      } else {
        blogPosts.forEach(post => {
          const postCategory = post.querySelector('.post-category').textContent.toLowerCase();
          post.style.display = postCategory.includes(category) ? 'block' : 'none';
        });
        
        featuredPosts.forEach(post => {
          const postCategory = post.querySelector('.post-category').textContent.toLowerCase();
          post.style.display = postCategory.includes(category) ? 'grid' : 'none';
        });
      }
    });
  });

  // Newsletter form functionality
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', handleNewsletterSubmit);
  }

  function handleNewsletterSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(newsletterForm);
    const data = {
      name: document.getElementById('newsletterName').value,
      email: document.getElementById('newsletterEmail').value,
      category: document.getElementById('newsletterCategory').value,
      consent: document.getElementById('newsletterConsent').checked
    };
    
    // Validate form
    if (!data.name || !data.email || !data.category || !data.consent) {
      showToast('Vui lòng điền đầy đủ thông tin và đồng ý điều khoản!', 'error');
      return;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      showToast('Email không hợp lệ!', 'error');
      return;
    }
    
    // Simulate form submission
    const submitBtn = newsletterForm.querySelector('.newsletter-submit');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<span class="btn-icon">⏳</span><span>Đang đăng ký...</span>';
    submitBtn.disabled = true;
    
    setTimeout(() => {
      showToast('Đăng ký thành công! Cảm ơn bạn đã quan tâm.', 'success');
      newsletterForm.reset();
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }, 2000);
  }

  // Blog post read more functionality
  const readMoreBtns = document.querySelectorAll('.read-more-btn');
  readMoreBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Tính năng đang được phát triển. Vui lòng quay lại sau!', 'success');
    });
  });

  // Blog view all posts functionality
  const viewAllBtn = document.querySelector('.blog-actions .btn');
  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Tính năng đang được phát triển. Vui lòng quay lại sau!', 'success');
    });
  }
}

// ===== SPLASH SCREEN HANDLER =====
function handleSplashStart() {
  try {
    // Start music if available
    if (elements.music) {
      elements.music.play().catch(err => {
        console.log('Music autoplay failed:', err);
        showToast('Nhạc nền không thể tự động phát. Vui lòng bật thủ công!', 'error');
      });
    }

    // Hide splash screen
    elements.splashScreen.classList.add('hidden');
    elements.splashOverlay.classList.add('active');
    
    // Show main content
    setTimeout(() => {
      elements.mainContent.classList.add('visible');
      elements.footer.classList.add('visible');
      elements.splashOverlay.classList.remove('active');
      
      // Start animations
      startAnimations();
    }, 300);

  } catch (error) {
    console.error('Splash screen error:', error);
    showToast('Có lỗi xảy ra, vui lòng tải lại trang!', 'error');
  }
}

// ===== MUSIC CONTROLS =====
function toggleMusic() {
  if (!elements.music) return;

  try {
    if (STATE.musicPlaying) {
      elements.music.pause();
      elements.musicToggle.setAttribute('aria-pressed', 'false');
      showToast('Nhạc nền đã tắt', 'success');
    } else {
      elements.music.play().catch(err => {
        console.log('Music play failed:', err);
        showToast('Không thể phát nhạc. Vui lòng kiểm tra cài đặt trình duyệt!', 'error');
        return;
      });
      elements.musicToggle.setAttribute('aria-pressed', 'true');
      showToast('Nhạc nền đã bật', 'success');
    }
    
    STATE.musicPlaying = !STATE.musicPlaying;
    updateMusicVisualizer();
    
  } catch (error) {
    console.error('Music toggle error:', error);
  }
}

function updateMusicVisualizer() {
  if (!elements.musicVisualizer) return;
  
  if (STATE.musicPlaying) {
    elements.musicVisualizer.style.display = 'flex';
  } else {
    elements.musicVisualizer.style.display = 'none';
  }
}

// ===== CANVAS SETUP =====
function setupCanvas() {
  resizeAllCanvas();
  
  // Initialize particle systems
  if (canvases.star && contexts.star) initStars();
  if (canvases.nebula && contexts.nebula) initNebula();
  if (canvases.cloud && contexts.cloud) initClouds();
  if (canvases.particle && contexts.particle) initInteractiveParticles();
  
  // Start animation loops
  if (!STATE.isReducedMotion) {
    if (canvases.star && contexts.star) animateStars();
    if (canvases.nebula && contexts.nebula) animateNebula();
    if (canvases.cloud && contexts.cloud) animateClouds();
    if (canvases.particle && contexts.particle) animateInteractiveParticles();
  }
}

function resizeAllCanvas() {
  Object.values(canvases).forEach(canvas => {
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  });
}

// ===== PARTICLE INITIALIZATION =====
function initParticles() {
  initStars();
  initNebula();
  initClouds();
  initInteractiveParticles();
}

function initStars() {
  particles.stars = [];
  const count = STATE.isMobile ? 150 : 400;
  
  for (let i = 0; i < count; i++) {
    particles.stars.push({
      x: Math.random() * canvases.star.width,
      y: Math.random() * canvases.star.height,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.8 + 0.2,
      dx: (Math.random() - 0.5) * (STATE.isMobile ? 0.1 : 0.2),
      dy: (Math.random() - 0.5) * (STATE.isMobile ? 0.1 : 0.2),
      twinkle: Math.random() * Math.PI * 2
    });
  }
}

function initNebula() {
  particles.nebula = [];
  const count = STATE.isMobile ? 200 : 600;
  
  for (let i = 0; i < count; i++) {
    particles.nebula.push({
      x: Math.random() * canvases.nebula.width,
      y: Math.random() * canvases.nebula.height,
      size: Math.random() * 3 + 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.4 + 0.1,
      dx: (Math.random() - 0.5) * (STATE.isMobile ? 0.02 : 0.05),
      dy: (Math.random() - 0.5) * (STATE.isMobile ? 0.02 : 0.05),
      pulse: Math.random() * Math.PI * 2
    });
  }
}

function initClouds() {
  particles.clouds = [];
  for (let i = 0; i < 25; i++) {
    const baseW = 80 + Math.random() * 120;
    const baseH = 30 + Math.random() * 50;
    particles.clouds.push({
      x: Math.random() * canvases.cloud.width,
      y: Math.random() * canvases.cloud.height * 0.6,
      baseW: baseW,
      baseH: baseH,
      w: baseW,
      h: baseH,
      dx: 0.05 + Math.random() * 0.15,
      alpha: 0.1 + Math.random() * 0.2,
      breath: Math.random() * Math.PI * 2
    });
  }
}

function initInteractiveParticles() {
  particles.interactive = [];
  const count = STATE.isMobile ? 20 : 50;
  
  for (let i = 0; i < count; i++) {
    particles.interactive.push({
      x: Math.random() * canvases.particle.width,
      y: Math.random() * canvases.particle.height,
      size: Math.random() * 2 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.5 + 0.2,
      baseX: 0,
      baseY: 0,
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.01
    });
  }
}

// ===== ANIMATION LOOPS =====
function animateStars() {
  if (STATE.pageHidden || !contexts.star || !canvases.star) {
    requestAnimationFrame(animateStars);
    return;
  }
  
  const ctx = contexts.star;
  const canvas = canvases.star;
  
  try {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const hour = new Date().getHours();
    const isDaytime = hour >= 6 && hour < 18;
    
    particles.stars.forEach(star => {
      // Update position
      star.x += star.dx;
      star.y += star.dy;
      star.twinkle += 0.02;
      
      // Bounce off edges
      if (star.x < 0 || star.x > canvas.width) star.dx *= -1;
      if (star.y < 0 || star.y > canvas.height) star.dy *= -1;
      
      // Calculate alpha based on time and twinkle
      let alpha = star.alpha * (isDaytime ? 0.3 : 1);
      alpha *= (Math.sin(star.twinkle) + 1) / 2 * 0.5 + 0.5;
      
      // Draw star
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
      
      // Add glow effect for larger stars
      if (star.r > 1) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.2})`;
        ctx.fill();
      }
    });
  } catch (error) {
    console.error('Stars animation error:', error);
  }
  
  requestAnimationFrame(animateStars);
}

function animateNebula() {
  if (!contexts.nebula || !canvases.nebula) {
    requestAnimationFrame(animateNebula);
    return;
  }
  
  const ctx = contexts.nebula;
  const canvas = canvases.nebula;
  
  try {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.nebula.forEach(particle => {
      // Update position
      particle.x += particle.dx;
      particle.y += particle.dy;
      particle.pulse += 0.01;
      
      // Wrap around edges
      if (particle.x < 0) particle.x = canvas.width;
      if (particle.x > canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = canvas.height;
      if (particle.y > canvas.height) particle.y = 0;
      
      // Calculate alpha with pulse effect
      const alpha = particle.alpha * (Math.sin(particle.pulse) + 1) / 2 * 0.3 + 0.7;
      
      // Draw particle with glow
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 3
      );
      gradient.addColorStop(0, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${alpha})`);
      gradient.addColorStop(0.5, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${alpha * 0.5})`);
      gradient.addColorStop(1, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 0)`);
      
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    });
  } catch (error) {
    console.error('Nebula animation error:', error);
  }
  
  requestAnimationFrame(animateNebula);
}

// ---------- Draw Clouds (ban ngày) ----------
function animateClouds() {
  if (!contexts.cloud || !canvases.cloud) {
    requestAnimationFrame(animateClouds);
    return;
  }
  
  const ctx = contexts.cloud;
  const canvas = canvases.cloud;
  
  try {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 18) {
      particles.clouds.forEach(c => {
        // Tạo hiệu ứng mây thực tế hơn với nhiều lớp
        ctx.save();
        
        // Lớp mây chính với gradient
        const gradient = ctx.createRadialGradient(
          c.x, c.y, 0,
          c.x, c.y, c.w
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${c.alpha})`);
        gradient.addColorStop(0.7, `rgba(255, 255, 255, ${c.alpha * 0.6})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
        
        ctx.fillStyle = gradient;
        
        // Vẽ hình dạng mây phức tạp hơn
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.w * 0.5, 0, Math.PI * 2);
        ctx.arc(c.x + c.w * 0.3, c.y - c.h * 0.2, c.w * 0.4, 0, Math.PI * 2);
        ctx.arc(c.x + c.w * 0.6, c.y, c.w * 0.45, 0, Math.PI * 2);
        ctx.arc(c.x + c.w * 0.9, c.y - c.h * 0.15, c.w * 0.35, 0, Math.PI * 2);
        ctx.arc(c.x - c.w * 0.2, c.y + c.h * 0.1, c.w * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Thêm bóng đổ cho mây
        ctx.fillStyle = `rgba(0, 0, 0, ${c.alpha * 0.1})`;
        ctx.beginPath();
        ctx.ellipse(c.x + 5, c.y + c.h * 0.3, c.w * 0.8, c.h * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // Di chuyển mây với tốc độ ngẫu nhiên
        c.x += c.dx;
        
        // Thêm hiệu ứng "thở" cho mây
        c.breath = (c.breath || 0) + 0.01;
        const breathScale = 1 + Math.sin(c.breath) * 0.05;
        c.w = c.baseW * breathScale;
        c.h = c.baseH * breathScale;
        
        // Reset vị trí khi mây ra khỏi màn hình
        if (c.x - c.w > canvas.width) {
          c.x = -c.w;
          c.y = Math.random() * canvas.height * 0.6;
          c.baseW = 80 + Math.random() * 120;
          c.baseH = 30 + Math.random() * 50;
          c.w = c.baseW;
          c.h = c.baseH;
          c.dx = 0.05 + Math.random() * 0.15;
          c.alpha = 0.1 + Math.random() * 0.2;
        }
      });
    }
  } catch (error) {
    console.error('Clouds animation error:', error);
  }
  
  requestAnimationFrame(animateClouds);
}

function animateInteractiveParticles() {
  if (!contexts.particle || !canvases.particle || STATE.isMobile) {
    requestAnimationFrame(animateInteractiveParticles);
    return;
  }
  
  const ctx = contexts.particle;
  const canvas = canvases.particle;
  
  try {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.interactive.forEach(particle => {
      // Update angle for orbital motion
      particle.angle += particle.speed;
      
      // Calculate distance from mouse
      const dx = STATE.mouseX - particle.x;
      const dy = STATE.mouseY - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Mouse interaction
      if (distance < 100) {
        const force = (100 - distance) / 100;
        particle.x -= (dx / distance) * force * 2;
        particle.y -= (dy / distance) * force * 2;
      } else {
        // Return to base position
        particle.x += (particle.baseX - particle.x) * 0.02;
        particle.y += (particle.baseY - particle.y) * 0.02;
      }
      
      // Add orbital motion
      const orbitX = Math.cos(particle.angle) * 20;
      const orbitY = Math.sin(particle.angle) * 20;
      
      // Draw particle
      ctx.beginPath();
      ctx.arc(particle.x + orbitX, particle.y + orbitY, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.alpha})`;
      ctx.fill();
      
      // Draw connection lines to nearby particles
      particles.interactive.forEach(otherParticle => {
        if (otherParticle !== particle) {
          const dx2 = particle.x - otherParticle.x;
          const dy2 = particle.y - otherParticle.y;
          const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          
          if (distance2 < 80) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${0.1 * (1 - distance2 / 80)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
    });
  } catch (error) {
    console.error('Interactive particles animation error:', error);
  }
  
  requestAnimationFrame(animateInteractiveParticles);
}

// ===== CUSTOM CURSOR =====
function setupCustomCursor() {
  if (STATE.isMobile || STATE.isReducedMotion) return;
  
  // Initialize base positions
  particles.interactive.forEach(particle => {
    particle.baseX = particle.x;
    particle.baseY = particle.y;
  });
  
  // Hide default cursor
  document.body.style.cursor = 'none';
}

function handleMouseMove(e) {
  STATE.mouseX = e.clientX;
  STATE.mouseY = e.clientY;
  
  if (!STATE.cursorVisible) return;
  
  // Update custom cursor positions
  if (elements.cursorDot) {
    elements.cursorDot.style.left = e.clientX + 'px';
    elements.cursorDot.style.top = e.clientY + 'px';
  }
  
  if (elements.cursorOutline) {
    elements.cursorOutline.style.left = e.clientX + 'px';
    elements.cursorOutline.style.top = e.clientY + 'px';
  }
  
  // Update interactive particle base positions
  particles.interactive.forEach(particle => {
    const dx = e.clientX - particle.x;
    const dy = e.clientY - particle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 200) {
      particle.baseX = e.clientX + (Math.random() - 0.5) * 100;
      particle.baseY = e.clientY + (Math.random() - 0.5) * 100;
    }
  });
}

// ===== REVEAL ANIMATION =====
function setupRevealAnimation() {
  checkReveal();
}

function checkReveal() {
  const viewportHeight = window.innerHeight;
  const triggerBottom = viewportHeight * 0.8;
  
  elements.reveals.forEach(element => {
    const rect = element.getBoundingClientRect();
    const delay = element.dataset.delay || 0;
    
    if (rect.top < triggerBottom) {
      setTimeout(() => {
        element.classList.add('show');
      }, parseInt(delay));
    }
  });
}

// ===== VANILLA TILT =====
function setupVanillaTilt() {
  if (typeof VanillaTilt === 'undefined' || !elements.card) return;
  
  try {
    VanillaTilt.init(elements.card, {
      max: 15,
      speed: 400,
      glare: true,
      'max-glare': 0.3,
      scale: 1.02,
      perspective: 1000
    });
  } catch (error) {
    console.log('Vanilla Tilt initialization failed:', error);
  }
}

// ===== UTILITY FUNCTIONS =====
function downloadHTML() {
  try {
    const htmlContent = document.documentElement.outerHTML;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nguyencanhdien_portfolio.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    showToast('Đã tải trang web thành công!', 'success');
    
  } catch (error) {
    console.error('Download error:', error);
    showToast('Không thể tải trang web. Vui lòng thử lại!', 'error');
  }
}

function copyEmail() {
  const email = 'nguyencanhdien2002.org@gmail.com';
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(email)
      .then(() => showToast('Email đã được sao chép!', 'success'))
      .catch(() => fallbackCopyEmail(email));
  } else {
    fallbackCopyEmail(email);
  }
}

function fallbackCopyEmail(email) {
  const textArea = document.createElement('textarea');
  textArea.value = email;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
    showToast('Email đã được sao chép!', 'success');
  } catch (error) {
    showToast('Không thể sao chép email. Vui lòng thử lại!', 'error');
  }
  
  document.body.removeChild(textArea);
}

function sharePage() {
  const title = 'Nguyễn Cảnh Điền - Du Học Sinh Hàn Quốc';
  const text = 'Khám phá trang cá nhân của Nguyễn Cảnh Điền';
  const url = window.location.href;
  
  if (navigator.share) {
    navigator.share({
      title: title,
      text: text,
      url: url
    }).catch(() => {
      fallbackShare(url);
    });
  } else {
    fallbackShare(url);
  }
}

function fallbackShare(url) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url)
      .then(() => showToast('Link đã được sao chép!', 'success'))
      .catch(() => showToast('Không thể chia sẻ. Vui lòng thử lại!', 'error'));
  } else {
    showToast('Không thể chia sẻ. Vui lòng thử lại!', 'error');
  }
}

function showToast(message, type = 'success') {
  if (!elements.toastContainer) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' ? '✅' : '❌';
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
  `;
  
  elements.toastContainer.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// ===== EVENT HANDLERS =====
function handleVisibilityChange() {
  STATE.pageHidden = document.hidden;
  
  if (STATE.pageHidden && elements.music && !elements.music.paused) {
    elements.music.pause();
  } else if (!STATE.pageHidden && elements.music && STATE.musicPlaying) {
    elements.music.play().catch(() => {});
  }
}

function handleResize() {
  resizeAllCanvas();
  initStars();
  initNebula();
  initClouds();
  initInteractiveParticles();
  checkReveal();
}

function handleScroll() {
  STATE.scrollY = window.scrollY;
  checkReveal();
}

function handleKeyboardShortcuts(e) {
  // Ctrl/Cmd + K: Focus search (if implemented)
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    // Implement search functionality if needed
  }
  
  // Ctrl/Cmd + D: Download page
  if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
    e.preventDefault();
    downloadHTML();
  }
  
  // Space: Toggle music
  if (e.code === 'Space' && e.target === document.body) {
    e.preventDefault();
    toggleMusic();
  }
  
  // Escape: Close modals (if any)
  if (e.key === 'Escape') {
    // Implement modal closing if needed
  }
}

// ===== ANIMATION STARTER =====
function startAnimations() {
  // Start staggered reveal animations
  elements.reveals.forEach((element, index) => {
    const delay = element.dataset.delay || index * 100;
    setTimeout(() => {
      element.classList.add('show');
    }, parseInt(delay));
  });
  
  // Start blob animations with different delays
  const blobs = document.querySelectorAll('.blob');
  blobs.forEach((blob, index) => {
    setTimeout(() => {
      blob.style.animationPlayState = 'running';
    }, index * 200);
  });
}

// ===== UTILITY FUNCTIONS =====
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ===== PERFORMANCE MONITORING =====
function monitorPerformance() {
  if ('performance' in window) {
    const perfData = performance.getEntriesByType('navigation')[0];
    console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
  }
}

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
  showToast('Có lỗi xảy ra. Vui lòng tải lại trang!', 'error');
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
  showToast('Có lỗi xảy ra. Vui lòng tải lại trang!', 'error');
});

// ===== INITIALIZATION =====
// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Monitor performance after page load
window.addEventListener('load', () => {
  setTimeout(monitorPerformance, 1000);
});

// Export for debugging
window.PORTFOLIO_STATE = STATE;
window.PORTFOLIO_ELEMENTS = elements;