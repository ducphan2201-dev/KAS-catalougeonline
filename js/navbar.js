/**
 * KAS Catalogue — Navbar Module
 */
const Navbar = (() => {
  function init() {
    initScrollEffect();
    initMobileMenu();
    initSmoothScroll();
    initActiveLink();
  }

  /**
   * Transparent to solid navbar on scroll
   */
  function initScrollEffect() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Check initial state
  }

  /**
   * Mobile hamburger menu
   */
  function initMobileMenu() {
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      const isOpen = links.classList.toggle('open');
      Animations.toggleScroll(isOpen);
    });

    // Close menu on link click
    links.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        links.classList.remove('open');
        Animations.toggleScroll(false);
      });
    });
  }

  /**
   * Smooth scrolling for anchor links
   */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          const offset = 80; // Navbar height
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }

  /**
   * Highlight active nav link based on scroll position
   */
  function initActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[data-section]');

    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
              link.classList.toggle(
                'active',
                link.getAttribute('data-section') === id
              );
            });
          }
        });
      },
      { rootMargin: '-20% 0px -80% 0px' }
    );

    sections.forEach(section => observer.observe(section));
  }

  return { init };
})();
