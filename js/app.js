/**
 * KAS Houzing — Main Application
 * Đọc CONFIG và áp dụng thông tin lên trang web
 */
const App = (() => {
  async function init() {
    console.log('%c Kas Houzing ', 'background:#c9a96e;color:#0a0a0a;font-size:16px;font-weight:bold;padding:8px 16px;');
    console.log(`%c ${CONFIG.BRAND.slogan} `, 'color:#c9a96e;font-style:italic;');

    // 1. Áp dụng thông tin từ CONFIG lên HTML
    applyConfig();

    // 2. Khởi tạo các module không cần hiển thị
    Navbar.init();
    Catalogue.init();
    Contact.init();

    // 3. Preload hero image
    await preload();

    // 4. Tải dữ liệu portfolio
    await Portfolio.init();

    // 5. Ẩn preloader, rồi chạy animations
    hidePreloader();
  }

  /**
   * Áp dụng thông tin từ CONFIG vào trang
   * Admin chỉ cần sửa config.js, JS sẽ cập nhật toàn bộ trang
   */
  function applyConfig() {
    const B = CONFIG.BRAND;
    const C = CONFIG.CONTACT;
    const S = CONFIG.SOCIAL;

    // ── Document title ──
    document.title = `${B.name} | ${B.tagline}`;

    // ── Preloader ──
    setText('loader-tagline', B.tagline);

    // ── Navbar ──
    setText('nav-brand-name', B.name);
    setText('nav-brand-tagline', B.tagline);
    applyLogo();

    // ── Hero ──
    setText('hero-tagline', B.tagline);
    setText('hero-brand-name', B.name);
    setText('hero-slogan-text', B.slogan);
    setText('hero-desc', B.description);

    // ── Portfolio ──
    const ptTitle = document.getElementById('portfolio-title');
    if (ptTitle) {
      ptTitle.innerHTML = `${CONFIG.PORTFOLIO.sectionTitle} <span class="gold">${CONFIG.PORTFOLIO.sectionHighlight}</span>`;
    }
    setText('portfolio-desc', CONFIG.PORTFOLIO.sectionDesc);
    renderFilterButtons();

    // ── Contact ──
    applyContact(C, S);

    // ── Footer ──
    setText('footer-brand-name', B.name);
    setText('footer-slogan', `"${B.slogan}"`);
    setText('footer-tagline', B.tagline);
    setText('footer-email', C.email);
    setText('footer-address', C.address);
    setText('footer-year', new Date().getFullYear().toString());
    setText('footer-copyright-name', B.name);

    if (C.phone) {
      setText('footer-phone', C.phone);
    } else {
      const fp = document.getElementById('footer-phone');
      if (fp) fp.style.display = 'none';
    }
  }

  /**
   * Logo: nếu CONFIG.BRAND.logoUrl có giá trị, thay text bằng hình
   */
  function applyLogo() {
    const logoUrl = CONFIG.BRAND.logoUrl;
    if (!logoUrl) return;

    // Navbar logo
    const navLogo = document.getElementById('nav-logo');
    if (navLogo) {
      const brandText = document.getElementById('nav-brand-name');
      if (brandText) {
        const img = document.createElement('img');
        img.src = logoUrl;
        img.alt = CONFIG.BRAND.name;
        img.className = 'logo-img';
        img.style.height = '36px';
        img.style.width = 'auto';
        brandText.replaceWith(img);
      }
    }

    // Hero logo
    const heroBrand = document.getElementById('hero-brand-name');
    if (heroBrand) {
      const img = document.createElement('img');
      img.src = logoUrl;
      img.alt = CONFIG.BRAND.name;
      img.className = 'hero-logo-img';
      img.style.maxHeight = '120px';
      img.style.width = 'auto';
      heroBrand.replaceWith(img);
    }
  }

  /**
   * Áp dụng thông tin liên hệ
   */
  function applyContact(C, S) {
    // Email
    const emailLink = document.getElementById('contact-email-link');
    if (emailLink) {
      emailLink.href = `mailto:${C.email}`;
      emailLink.textContent = C.email;
    }

    // Phone — ẩn nếu chưa có
    const phoneItem = document.getElementById('contact-phone-item');
    if (C.phone) {
      if (phoneItem) phoneItem.style.display = '';
      const phoneLink = document.getElementById('contact-phone-link');
      if (phoneLink) {
        phoneLink.href = `tel:${C.phone.replace(/\s/g, '')}`;
        phoneLink.textContent = C.phone;
      }
    }

    // Address
    setText('contact-address-text', C.address);

    // Social Media
    renderSocials(S);
  }

  /**
   * Render social media links từ CONFIG
   */
  function renderSocials(S) {
    const container = document.getElementById('contact-socials');
    if (!container) return;

    const icons = {
      facebook: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
      instagram: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
      youtube: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#0a0a0a"/></svg>',
      tiktok: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .56.04.82.12v-3.5a6.37 6.37 0 0 0-.82-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.13a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.56z"/></svg>',
      zalo: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.03 2 10.95c0 2.72 1.36 5.15 3.5 6.76v3.29l3.12-1.72c.88.25 1.8.38 2.76.38h.12c5.52 0 10-4.03 10-8.95S17.52 2 12 2zm1 12h-4l5-7h-4V6h4l-5 7h4v1z"/></svg>',
    };

    const labels = {
      facebook: 'Facebook',
      instagram: 'Instagram',
      youtube: 'YouTube',
      tiktok: 'TikTok',
      zalo: 'Zalo',
    };

    let html = '';
    for (const [key, url] of Object.entries(S)) {
      if (url && icons[key]) {
        html += `<a href="${url}" class="social-link" aria-label="${labels[key]}" target="_blank" rel="noopener noreferrer">${icons[key]}</a>`;
      }
    }
    container.innerHTML = html;
  }

  /**
   * Render filter buttons từ CONFIG.PORTFOLIO.categories
   */
  function renderFilterButtons() {
    const container = document.getElementById('portfolio-filters');
    if (!container) return;

    container.innerHTML = CONFIG.PORTFOLIO.categories.map(cat =>
      `<button class="filter-btn${cat.key === 'all' ? ' active' : ''}" data-filter="${cat.key}">${cat.label}</button>`
    ).join('');
  }

  /**
   * Helper: set text content an toàn
   */
  function setText(id, text) {
    const el = document.getElementById(id);
    if (el && text) el.textContent = text;
  }

  /**
   * Preload hero image
   */
  function preload() {
    return new Promise((resolve) => {
      const heroImg = document.getElementById('hero-bg-img');
      if (heroImg && heroImg.src) {
        if (heroImg.complete) {
          resolve();
        } else {
          heroImg.onload = resolve;
          heroImg.onerror = resolve;
        }
      } else {
        resolve();
      }
      setTimeout(resolve, 3000);
    });
  }

  /**
   * Ẩn preloader, rồi khởi tạo animations
   */
  function hidePreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) {
      Animations.init();
      return;
    }

    setTimeout(() => {
      preloader.classList.add('loaded');
      setTimeout(() => {
        preloader.remove();
        Animations.init();
      }, 800);
    }, 2800);
  }

  return { init };
})();

// Start app khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', App.init);
