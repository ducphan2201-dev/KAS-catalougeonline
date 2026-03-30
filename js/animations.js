/**
 * KAS Catalogue — Animations Module
 * GSAP-powered scroll animations and effects
 */
const Animations = (() => {
  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP not loaded. Falling back to CSS animations.');
      initFallback();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    initScrollAnimations();
    initParallax();
    initCounters();
    createParticles();
  }

  /**
   * Scroll-triggered reveal animations
   */
  function initScrollAnimations() {
    const elements = document.querySelectorAll('[data-animate]');

    elements.forEach(el => {
      const type = el.getAttribute('data-animate');
      const delay = parseFloat(el.getAttribute('data-delay') || '0');
      const isHeroElement = el.closest('#hero') !== null;

      const fromVars = { opacity: 0, duration: 0.8 };

      switch (type) {
        case 'fade-up':
          fromVars.y = 40;
          break;
        case 'fade-down':
          fromVars.y = -40;
          break;
        case 'fade-right':
          fromVars.x = -40;
          break;
        case 'fade-left':
          fromVars.x = 40;
          break;
      }

      if (isHeroElement) {
        // Hero elements: animate immediately with stagger (preloader already gone)
        fromVars.delay = delay;
        gsap.from(el, {
          ...fromVars,
          ease: 'power3.out',
          onComplete: () => el.classList.add('animated'),
        });
      } else {
        // Other elements: animate on scroll
        fromVars.delay = delay;
        gsap.from(el, {
          ...fromVars,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            once: true,
            onEnter: () => el.classList.add('animated'),
          },
        });
      }
    });
  }

  /**
   * Parallax effect on hero background
   */
  function initParallax() {
    const heroBg = document.querySelector('.hero-bg-img');
    if (!heroBg) return;

    gsap.to(heroBg, {
      y: '20%',
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    });

    // Mark hero as in-view for the scale animation
    const hero = document.getElementById('hero');
    if (hero) {
      setTimeout(() => hero.classList.add('in-view'), 100);
    }
  }

  /**
   * Counter animation for stats
   */
  function initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');

    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-count'));

      gsap.to(counter, {
        innerText: target,
        duration: 2,
        ease: 'power2.out',
        snap: { innerText: 1 },
        scrollTrigger: {
          trigger: counter,
          start: 'top 80%',
          once: true,
        },
      });
    });
  }

  /**
   * Floating gold particles in hero
   */
  function createParticles() {
    const container = document.getElementById('hero-particles');
    if (!container) return;

    const particleCount = window.innerWidth > 768 ? 30 : 15;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 8 + 's';
      particle.style.animationDuration = (6 + Math.random() * 6) + 's';
      particle.style.width = (1 + Math.random() * 3) + 'px';
      particle.style.height = particle.style.width;
      particle.style.opacity = 0;
      container.appendChild(particle);
    }
  }

  /**
   * Animate portfolio cards on load
   */
  function animatePortfolioCards() {
    const cards = document.querySelectorAll('.portfolio-card');
    if (typeof gsap === 'undefined') {
      cards.forEach(c => { c.style.opacity = 1; });
      return;
    }

    gsap.from(cards, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#portfolio-grid',
        start: 'top 85%',
        once: true,
      },
    });
  }

  /**
   * Fallback for when GSAP is not available
   */
  function initFallback() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const delay = parseFloat(entry.target.getAttribute('data-delay') || '0') * 1000;
            setTimeout(() => {
              entry.target.classList.add('animated');
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

    // Hero in-view
    const hero = document.getElementById('hero');
    if (hero) setTimeout(() => hero.classList.add('in-view'), 100);

    // Simple counter
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-count'));
            animateCounter(el, target);
            counterObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll('.stat-number[data-count]').forEach(el => counterObserver.observe(el));
    createParticles();
  }

  function animateCounter(el, target) {
    let current = 0;
    const step = target / 60;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        el.textContent = target;
        clearInterval(interval);
      } else {
        el.textContent = Math.floor(current);
      }
    }, 30);
  }

  return {
    init,
    animatePortfolioCards,
  };
})();
