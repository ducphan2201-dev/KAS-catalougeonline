/**
 * KAS Catalogue — Page Flip Catalogue Module
 * Uses StPageFlip for magazine-style page turning effect
 */
const Catalogue = (() => {
  let pageFlip = null;
  let currentProject = null;
  let currentLayout = null;
  let isGalleryView = false;
  let lightboxInstance = null;

  function init() {
    // Modal controls
    document.getElementById('modal-close')?.addEventListener('click', close);
    document.getElementById('modal-overlay')?.addEventListener('click', close);
    
    // Allow closing when clicking the empty margins inside the container
    document.querySelector('.modal-container')?.addEventListener('click', function(e) {
      if (e.target === this || 
          e.target.classList.contains('modal-body') || 
          e.target.classList.contains('flipbook-wrapper') ||
          e.target.classList.contains('flipbook-container')) {
        close();
      }
    });
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

  async function open(project) {
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

    // Show modal loading state to feel fast
    const fbContainer = document.getElementById('flipbook-container');
    if (fbContainer) {
      fbContainer.innerHTML = '<div style="display:flex;width:100%;height:100%;align-items:center;justify-content:center;color:var(--gold);"><div class="loading-spinner"></div></div>';
    }

    modal.classList.add('active');
    Animations.toggleScroll(true);

    // Calculate layout asynchronously (detecting portrait vs landscape)
    currentLayout = await calculateLayout(project);

    // Build pages with spread awareness
    buildFlipbook(project, currentLayout);
    buildThumbnails(project, currentLayout);
    buildGallery(project);

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
    Animations.toggleScroll(false);

    // Safely destroy PageFlip without breaking the main thread
    if (pageFlip) {
      try {
        pageFlip.destroy();
      } catch (e) {
        console.warn('PageFlip cleanup:', e);
      }
      pageFlip = null;
    }
    currentProject = null;
  }

  async function calculateLayout(project) {
    const layout = { pages: [], imageMap: {} }; 
    let pageCount = 0; // Current sequential page count in the book

    // Page 0: Cover
    layout.pages.push({ type: 'cover', image: project.coverImage, imageIndex: 0 });
    layout.imageMap[0] = 0;
    pageCount++;

    // Page 1: Info Page
    layout.pages.push({ type: 'info' });
    layout.imageMap['info'] = 1;
    pageCount++;

    // Preload image dimensions (skip Cover Image)
    const promises = project.images.map((imgUrl, index) => {
      if (index === 0) return Promise.resolve(null); 
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ url: imgUrl, isLandscape: img.naturalWidth > img.naturalHeight, index });
        img.onerror = () => resolve({ url: imgUrl, isLandscape: false, index });
        img.src = imgUrl;
      });
    });

    const results = await Promise.all(promises);
    
    results.forEach((info) => {
      if (!info) return; // skip cover
      
      const { url, isLandscape, index } = info;
      
      if (isLandscape) { // If image is wide
        // Spread needs to start on an EVEN index page (Left side of the book when opened)
        if (pageCount % 2 !== 0) {
          layout.pages.push({ type: 'padder' });
          pageCount++;
        }
        
        // Map thumbnail to the left half of the spread
        layout.imageMap[index] = pageCount;
        layout.pages.push({ type: 'spread-left', image: url, imageIndex: index });
        pageCount++;
        layout.pages.push({ type: 'spread-right', image: url, imageIndex: index });
        pageCount++;
      } else { // Portrait
        layout.imageMap[index] = pageCount;
        layout.pages.push({ type: 'portrait', image: url, imageIndex: index });
        pageCount++;
      }
    });

    // StPageFlip requires an even number of total pages to prevent engine crashing
    if (pageCount % 2 !== 0) {
      layout.pages.push({ type: 'padder-end' });
      pageCount++;
    }

    return layout;
  }

  function buildFlipbook(project, layout) {
    // Recreate the #flipbook element entirely to prevent lingering DOM corruption
    const wrapper = document.getElementById('flipbook-container');
    wrapper.innerHTML = '<div id="flipbook"></div>';
    const container = document.getElementById('flipbook');

    layout.pages.forEach(pageData => {
      const page = document.createElement('div');
      page.className = 'page';
      
      if (pageData.type === 'cover') {
        page.innerHTML = `<img src="${pageData.image}" alt="Cover" style="width:100%;height:100%;object-fit:cover;object-position:bottom;">`;
      } 
      else if (pageData.type === 'info') {
        page.className = 'page page-info';
        page.innerHTML = `
          <div class="info-content-wrapper">
            <h2 class="info-title">${project.name}</h2>
            <div class="info-divider"></div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-lbl">Địa chỉ</span>
                <span class="info-vlu">${project.address}</span>
              </div>
              <div class="info-item">
                <span class="info-lbl">Diện tích</span>
                <span class="info-vlu">${project.area}</span>
              </div>
              <div class="info-item">
                <span class="info-lbl">Phân loại</span>
                <span class="info-vlu">${project.style}</span>
              </div>
              <div class="info-item">
                <span class="info-lbl">Năm HT</span>
                <span class="info-vlu">${project.year}</span>
              </div>
            </div>
            ${project.description ? `<div class="info-desc">${project.description}</div>` : ''}
          </div>
        `;
      }
      else if (pageData.type === 'padder' || pageData.type === 'padder-end') {
        page.style.background = 'var(--bg-primary)';
        page.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;"><h3 style="color:var(--gold);font-family:var(--font-display);font-style:italic;opacity:0.3;">KAS HOUZING</h3></div>';
      }
      else if (pageData.type === 'portrait') {
        page.innerHTML = `<img src="${pageData.image}" loading="lazy" style="width:100%;height:100%;object-fit:cover;object-position:bottom;">`;
      }
      else if (pageData.type === 'spread-left') {
        page.style.overflow = 'hidden';
        page.innerHTML = `<img src="${pageData.image}" loading="lazy" style="width:200%; max-width:200%; height:100%; object-fit:cover; object-position: left bottom; pointer-events:none;">`;
      }
      else if (pageData.type === 'spread-right') {
        page.style.overflow = 'hidden';
        page.innerHTML = `<img src="${pageData.image}" loading="lazy" style="width:200%; max-width:200%; height:100%; object-fit:cover; object-position: right bottom; margin-left: -100%; pointer-events:none;">`;
      }
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

  function buildThumbnails(project, layout) {
    const container = document.getElementById('flipbook-thumbnails');
    if (!container) return;

    container.innerHTML = project.images.map((imgUrl, index) => {
      const targetPage = layout ? layout.imageMap[index] : index;
      return `
      <div class="thumb-item ${index === 0 ? 'active' : ''}" 
           onclick="Catalogue.goToPage(${targetPage})"
           data-page="${targetPage}" data-index="${index}">
        <img src="${imgUrl}" alt="Trang ${index + 1}" loading="lazy">
      </div>
    `}).join('');
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
    if (!el || !currentLayout) return;
    
    // Total physical pages in the flipbook
    let total = currentLayout.pages.length;
    
    // Subtract padding pages from total count if any exist at the end
    if (currentLayout.pages[currentLayout.pages.length-1]?.type === 'padder-end') total--;

    const current = Math.min((pageIndex || 0) + 1, total);
    el.textContent = `Trang ${current} / ${total}`;
  }

  function updateThumbnailActive(pageIndex) {
    if (!currentLayout) return;
    
    const thumbs = document.querySelectorAll('.thumb-item');
    thumbs.forEach(t => t.classList.remove('active'));

    // Because a spread image can occupy 2 pages (N and N+1) and padders offset sequencing,
    // we find the newest thumbnail whose start page is <= current pageIndex.
    let activeThumb = null;
    let highestPage = -1;
    
    thumbs.forEach((thumb) => {
      const p = parseInt(thumb.dataset.page);
      if (p <= pageIndex && p > highestPage) {
        highestPage = p;
        activeThumb = thumb;
      }
    });

    if (activeThumb) {
      activeThumb.classList.add('active');
      activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  return {
    init,
    open,
    close,
    goToPage,
  };
})();
