/**
 * KAS Catalogue — Page Flip Catalogue Module
 * Uses StPageFlip for magazine-style page turning effect
 */
const Catalogue = (() => {
  let pageFlip = null;
  let currentProject = null;
  let isGalleryView = false;
  let lightboxInstance = null;

  function init() {
    // Modal controls
    document.getElementById('modal-close')?.addEventListener('click', close);
    document.getElementById('modal-overlay')?.addEventListener('click', close);
    document.getElementById('flip-prev')?.addEventListener('click', () => flipPrev());
    document.getElementById('flip-next')?.addEventListener('click', () => flipNext());
    document.getElementById('modal-gallery-btn')?.addEventListener('click', toggleView);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!currentProject) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') flipPrev();
      if (e.key === 'ArrowRight') flipNext();
    });
  }

  function open(project) {
    currentProject = project;
    isGalleryView = false;

    const modal = document.getElementById('project-modal');
    const title = document.getElementById('modal-title');
    const subtitle = document.getElementById('modal-subtitle');

    title.textContent = project.name;
    subtitle.textContent = `${project.area} · ${project.style} · ${project.address}`;

    // Show flipbook, hide gallery
    document.getElementById('flipbook-wrapper').style.display = '';
    document.getElementById('gallery-view').style.display = 'none';

    // Build pages
    buildFlipbook(project);
    buildThumbnails(project);
    buildGallery(project);

    // Show modal
    modal.classList.add('active');
    document.body.classList.add('no-scroll');

    // Initialize PageFlip after DOM paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        initPageFlip(project);
      });
    });
  }

  function close() {
    const modal = document.getElementById('project-modal');
    modal.classList.remove('active');
    document.body.classList.remove('no-scroll');

    // Destroy PageFlip
    if (pageFlip) {
      pageFlip.destroy();
      pageFlip = null;
    }
    currentProject = null;
  }

  function buildFlipbook(project) {
    const container = document.getElementById('flipbook');
    container.innerHTML = '';

    // Cover page: first image
    const coverPage = document.createElement('div');
    coverPage.className = 'page';
    coverPage.innerHTML = `<img src="${project.coverImage}" alt="${project.name} - Cover" style="width:100%;height:100%;object-fit:cover;">`;
    container.appendChild(coverPage);

    // Info page
    const infoPage = document.createElement('div');
    infoPage.className = 'page page-info';
    infoPage.innerHTML = `
      <h2>${project.name}</h2>
      <div class="page-info-item">
        <span class="page-info-label">Địa chỉ</span>
        <span class="page-info-value">${project.address}</span>
      </div>
      <div class="page-info-item">
        <span class="page-info-label">Diện tích</span>
        <span class="page-info-value">${project.area}</span>
      </div>
      <div class="page-info-item">
        <span class="page-info-label">Phong cách</span>
        <span class="page-info-value">${project.style}</span>
      </div>
      <div class="page-info-item">
        <span class="page-info-label">Năm hoàn thành</span>
        <span class="page-info-value">${project.year}</span>
      </div>
      ${project.description ? `<div class="page-info-desc">${project.description}</div>` : ''}
    `;
    container.appendChild(infoPage);

    // Image pages (skip first since it's the cover)
    project.images.forEach((imgUrl, index) => {
      if (index === 0) return; // Skip cover image
      const page = document.createElement('div');
      page.className = 'page';
      const img = document.createElement('img');
      img.src = imgUrl;
      img.alt = `${project.name} - Ảnh ${index + 1}`;
      img.loading = 'lazy';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.onerror = function() {
        this.parentElement.style.background = 'var(--bg-surface)';
        this.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-size:0.9rem;">Không thể tải ảnh</div>';
      };
      page.appendChild(img);
      container.appendChild(page);
    });
  }

  function initPageFlip(project) {
    const container = document.getElementById('flipbook');
    if (!container || typeof St === 'undefined') {
      // StPageFlip not loaded, use simple slider
      initSimpleSlider(project);
      return;
    }

    try {
      const wrapper = document.getElementById('flipbook-container');
      const wrapperRect = wrapper.getBoundingClientRect();
      
      // Calculate dimensions to fit the container
      const maxW = Math.min(wrapperRect.width * 0.45, CONFIG.FLIPBOOK.maxWidth);
      const maxH = Math.min(wrapperRect.height - 20, CONFIG.FLIPBOOK.maxHeight);
      const ratio = 3 / 4;
      
      let w = maxW;
      let h = w / ratio;
      
      if (h > maxH) {
        h = maxH;
        w = h * ratio;
      }

      pageFlip = new St.PageFlip(container, {
        width: Math.round(w),
        height: Math.round(h),
        size: 'stretch',
        minWidth: CONFIG.FLIPBOOK.minWidth,
        maxWidth: Math.round(maxW),
        minHeight: CONFIG.FLIPBOOK.minHeight,
        maxHeight: Math.round(maxH),
        showCover: false,
        maxShadowOpacity: 0.5,
        mobileScrollSupport: false,
        flippingTime: 800,
        usePortrait: window.innerWidth < 768,
        startZIndex: 0,
        autoSize: true,
        drawShadow: true,
        showPageCorners: true,
      });

      const pages = container.querySelectorAll('.page');
      pageFlip.loadFromHTML(pages);

      updatePageCounter();

      pageFlip.on('flip', (e) => {
        updatePageCounter(e.data);
        updateThumbnailActive(e.data);
      });
    } catch (error) {
      console.error('PageFlip init error:', error);
      initSimpleSlider(project);
    }
  }

  function initSimpleSlider(project) {
    // Fallback: Simple image slider if PageFlip fails
    const container = document.getElementById('flipbook');
    container.innerHTML = '';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';

    let currentIndex = 0;
    const images = project.images;

    const img = document.createElement('img');
    img.src = images[0];
    img.alt = project.name;
    img.style.maxHeight = '100%';
    img.style.maxWidth = '100%';
    img.style.objectFit = 'contain';
    img.style.borderRadius = '4px';
    container.appendChild(img);

    // Override flip buttons for slider
    document.getElementById('flip-prev').onclick = () => {
      currentIndex = Math.max(0, currentIndex - 1);
      img.src = images[currentIndex];
      updatePageCounter(currentIndex);
      updateThumbnailActive(currentIndex);
    };

    document.getElementById('flip-next').onclick = () => {
      currentIndex = Math.min(images.length - 1, currentIndex + 1);
      img.src = images[currentIndex];
      updatePageCounter(currentIndex);
      updateThumbnailActive(currentIndex);
    };

    updatePageCounter(0);
  }

  function buildThumbnails(project) {
    const container = document.getElementById('flipbook-thumbnails');
    if (!container) return;

    container.innerHTML = project.images.map((imgUrl, index) => `
      <div class="thumb-item ${index === 0 ? 'active' : ''}" 
           onclick="Catalogue.goToPage(${index + 1})"
           data-page="${index + 1}">
        <img src="${imgUrl}" alt="Trang ${index + 1}" loading="lazy">
      </div>
    `).join('');
  }

  function buildGallery(project) {
    const container = document.getElementById('gallery-grid');
    if (!container) return;

    container.innerHTML = project.images.map((imgUrl, index) => `
      <a href="${imgUrl}" class="gallery-item glightbox" data-gallery="project-gallery">
        <img src="${imgUrl}" alt="${project.name} - Ảnh ${index + 1}" loading="lazy">
      </a>
    `).join('');
  }

  function toggleView() {
    isGalleryView = !isGalleryView;

    const flipWrapper = document.getElementById('flipbook-wrapper');
    const flipFooter = document.querySelector('.flipbook-footer');
    const galleryView = document.getElementById('gallery-view');

    if (isGalleryView) {
      flipWrapper.style.display = 'none';
      flipFooter.style.display = 'none';
      galleryView.style.display = '';

      // Init GLightbox for gallery
      if (typeof GLightbox !== 'undefined') {
        if (lightboxInstance) lightboxInstance.destroy();
        lightboxInstance = GLightbox({
          selector: '.glightbox',
          touchNavigation: true,
          closeOnOutsideClick: true,
        });
      }
    } else {
      flipWrapper.style.display = '';
      flipFooter.style.display = '';
      galleryView.style.display = 'none';
    }
  }

  function flipPrev() {
    if (pageFlip) pageFlip.flipPrev();
  }

  function flipNext() {
    if (pageFlip) pageFlip.flipNext();
  }

  function goToPage(pageNum) {
    if (pageFlip) pageFlip.flip(pageNum);
  }

  function updatePageCounter(pageIndex) {
    const el = document.getElementById('flip-pages');
    if (!el || !currentProject) return;
    const total = currentProject.images.length + 1; // +1 for info page
    const current = (pageIndex || 0) + 1;
    el.textContent = `Trang ${current} / ${total}`;
  }

  function updateThumbnailActive(pageIndex) {
    const thumbs = document.querySelectorAll('.thumb-item');
    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle('active', i === (pageIndex || 0) - 1);
    });
  }

  return {
    init,
    open,
    close,
    goToPage,
  };
})();
