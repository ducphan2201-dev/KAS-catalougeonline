/**
 * KAS Catalogue — Animations Module
 * High-End Redesign: Lenis Smooth Scroll + GSAP
 */
const Animations = (() => {
  let lenisInstance = null;

  function init() {
    initLenis();

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP not loaded.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Sync Lenis with GSAP ScrollTrigger
    if (lenisInstance) {
      lenisInstance.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenisInstance.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0, 0);
    }

    initScrollAnimations();
    initParallax();
    createParticles();
  }

  /**
   * Khởi tạo Lenis Soft Scroll
   */
  function initLenis() {
    if (typeof Lenis !== 'undefined') {
      lenisInstance = new Lenis({
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2,
      });

      function raf(time) {
        lenisInstance.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  /**
   * GSAP Scroll-triggered reveal animations (Slow & Elegant)
   */
  function initScrollAnimations() {
    const elements = document.querySelectorAll('[data-animate]');

    elements.forEach(el => {
      const type = el.getAttribute('data-animate');
      const delay = parseFloat(el.getAttribute('data-delay') || '0');
      const isHeroElement = el.closest('#hero') !== null;

      // Make duration much longer for luxury feel
      const fromVars = { opacity: 0, duration: 1.5, ease: 'power4.out' };

      switch (type) {
        case 'fade-up':
          fromVars.y = 60;
          break;
        case 'fade-down':
          fromVars.y = -60;
          break;
        case 'fade-right':
          fromVars.x = -60;
          break;
        case 'fade-left':
          fromVars.x = 60;
          break;
      }

      if (isHeroElement) {
        fromVars.delay = delay;
        gsap.from(el, fromVars);
      } else {
        fromVars.delay = delay;
        gsap.from(el, {
          ...fromVars,
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
        });
      }
    });

    // Special line animations
    document.querySelectorAll('.section-line').forEach(line => {
      gsap.from(line, {
        width: 0,
        duration: 1.5,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: line,
          start: 'top 90%',
          once: true,
        }
      });
    });
  }

  /**
   * Parallax effect on hero background (Slower)
   */
  function initParallax() {
    const heroBg = document.querySelector('.hero-bg-img');
    if (!heroBg) return;

    gsap.to(heroBg, {
      y: '30%',
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5, // Smoother scrub
      },
    });

    // Scale down hero bg slightly on load to create a cinematic intro
    gsap.from(heroBg, {
      scale: 1.15,
      duration: 3,
      ease: 'power3.out'
    });
  }

  /**
   * Floating particles in hero (Slower, finer)
   */
  function createParticles() {
    const container = document.getElementById('hero-particles');
    if (!container) return;

    const particleCount = window.innerWidth > 768 ? 20 : 10;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 8 + 's';
      particle.style.animationDuration = (10 + Math.random() * 10) + 's'; // Slower
      particle.style.width = (1 + Math.random() * 2) + 'px'; // Smaller
      particle.style.height = particle.style.width;
      particle.style.opacity = 0;
      particle.style.background = 'var(--gold)';
      particle.style.position = 'absolute';
      particle.style.bottom = '-10px';
      particle.style.borderRadius = '50%';
      // Add keyframes dynamically or rely on CSS. 
      // We will rely on CSS animation 'floatUp' which we need to define in main.css if not there, or animate with GSAP.
      
      // Let's just animate with GSAP for better control
      container.appendChild(particle);
      
      animateParticle(particle);
    }
  }

  function animateParticle(p) {
    if (typeof gsap === 'undefined') return;
    
    gsap.to(p, {
      y: -(window.innerHeight * (0.5 + Math.random())),
      x: (Math.random() - 0.5) * 50,
      opacity: Math.random() * 0.5,
      duration: 10 + Math.random() * 10,
      ease: 'none',
      delay: Math.random() * 5,
      onComplete: () => {
        gsap.set(p, { y: 0, x: 0, opacity: 0 });
        animateParticle(p);
      }
    });
  }

  /**
   * Animate portfolio cards dynamically
   */
  function animatePortfolioCards() {
    const cards = document.querySelectorAll('.portfolio-card');
    if (cards.length === 0 || typeof gsap === 'undefined') return;

    cards.forEach((card, i) => {
      gsap.from(card, {
        opacity: 0,
        y: 80,
        duration: 1.5,
        delay: i * 0.1,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          once: true,
        },
      });
    });
  }

  /**
   * Pause/Resume Lenis when Opening Modal
   */
  function toggleScroll(isLocked) {
    if (lenisInstance) {
      if (isLocked) {
        lenisInstance.stop();
      } else {
        lenisInstance.start();
      }
    } else {
      document.body.classList.toggle('no-scroll', isLocked);
    }
  }

  return {
    init,
    animatePortfolioCards,
    toggleScroll
  };
})();
