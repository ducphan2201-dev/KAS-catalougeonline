/**
 * KAS Catalogue — Portfolio Module
 * Renders portfolio grid, handles filtering and card interactions
 */
const Portfolio = (() => {
  let allProjects = [];
  let currentFilter = 'all';

  async function init() {
    showLoading(true);

    try {
      allProjects = await DriveService.getProjects();
      renderGrid(allProjects);
      initFilters();
      Animations.animatePortfolioCards();
    } catch (error) {
      console.error('Error loading portfolio:', error);
      document.getElementById('portfolio-grid').innerHTML =
        '<p style="text-align:center;color:var(--text-muted);grid-column:1/-1;padding:40px;">Không thể tải dự án. Vui lòng thử lại sau.</p>';
    } finally {
      showLoading(false);
    }
  }

  function renderGrid(projects) {
    const grid = document.getElementById('portfolio-grid');
    if (!grid) return;

    grid.innerHTML = projects.map((project, index) => `
      <div class="portfolio-card" 
           data-project-id="${project.id}" 
           data-category="${project.category}"
           onclick="Portfolio.openProject('${project.id}')">
        <img 
          class="portfolio-card-img" 
          src="${project.coverImage}" 
          alt="${project.name}"
          loading="${index < 3 ? 'eager' : 'lazy'}"
          onerror="this.style.background='var(--bg-surface)'"
        >
        <div class="portfolio-card-overlay"></div>
        <div class="portfolio-card-content">
          <div class="portfolio-card-category">${getCategoryLabel(project.category)}</div>
          <h3 class="portfolio-card-title">${project.name}</h3>
          <p class="portfolio-card-meta">${project.area} · ${project.style}</p>
          <div class="portfolio-card-cta">
            Xem dự án
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        </div>
      </div>
    `).join('');
  }

  function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active state
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        currentFilter = btn.getAttribute('data-filter');
        filterProjects(currentFilter);
      });
    });
  }

  function filterProjects(category) {
    const cards = document.querySelectorAll('.portfolio-card');

    cards.forEach((card, index) => {
      const cardCategory = card.getAttribute('data-category');
      const show = category === 'all' || cardCategory === category;

      if (typeof gsap !== 'undefined') {
        gsap.to(card, {
          opacity: show ? 1 : 0,
          scale: show ? 1 : 0.95,
          duration: 0.3,
          delay: show ? index * 0.05 : 0,
          onComplete: () => {
            card.style.display = show ? '' : 'none';
          },
        });
      } else {
        card.style.display = show ? '' : 'none';
        card.style.opacity = show ? 1 : 0;
      }
    });
  }

  function getCategoryLabel(category) {
    const cat = CONFIG.PORTFOLIO.categories.find(c => c.key === category);
    return cat ? cat.label : category;
  }

  function showLoading(visible) {
    const loader = document.getElementById('portfolio-loading');
    if (loader) {
      loader.classList.toggle('visible', visible);
    }
    const grid = document.getElementById('portfolio-grid');
    if (grid) {
      grid.style.display = visible ? 'none' : '';
    }
  }

  function openProject(projectId) {
    const project = allProjects.find(p => p.id === projectId);
    if (!project) return;
    Catalogue.open(project);
  }

  function getProject(projectId) {
    return allProjects.find(p => p.id === projectId);
  }

  return {
    init,
    openProject,
    getProject,
  };
})();
