const projectsDataUrl = 'https://www.medieninformatik.th-koeln.de/project-data.php';

/* Helpers
############################################################################ */
const escapeHtml = (value) => {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

const sortByDateDesc = (projects) => {
  return projects.slice().sort((a, b) => {
    const aTime = new Date(a.date || a.updatedAt || 0);
    const bTime = new Date(b.date || b.updatedAt || 0);
    return bTime - aTime;
  });
};

const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

// Erwartet ein ISO-Datum wie "2024-04-04" und liefert "April 2024".
const formatMonthYear = (value) => {
  if (!value) return '';
  const match = String(value).match(/^(\d{4})-(\d{2})/);
  if (!match) return '';
  const year = match[1];
  const monthIndex = Number(match[2]) - 1;
  const monthName = MONTH_NAMES[monthIndex];
  if (!monthName) return '';
  return `${monthName} ${year}`;
};

/* Suche
############################################################################ */
// Baut aus den relevanten Feldern eines Projekts einen normalisierten
// Suchindex, damit der Freitext über alle Arbeiten im JSON filtern kann.
const buildSearchIndex = (project) => {
  return [
    project.name,
    project.type,
    project.author,
    project.first_supervisor,
    project.second_supervisor,
    project.keywords,
    project.partner,
    formatMonthYear(project.date || project.updatedAt),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
};

const matchesQuery = (project, terms) => {
  const index = project._searchIndex;
  return terms.every((term) => index.includes(term));
};

/* Rendering
############################################################################ */
const renderProjectCard = (project) => {
  const name = escapeHtml(project.name);
  const url = escapeHtml(project.url);
  const type = escapeHtml(project.type);
  const author = escapeHtml(project.author);

  const image = project.image
    ? `<img loading="lazy" src="${escapeHtml(project.image)}" alt="${name}">`
    : '';

  const monthYear = escapeHtml(formatMonthYear(project.date || project.updatedAt));


  const authorCode = author ? `<p class="is-small card-author">${type} von ${author}, ${monthYear}</p>` : '';


  const supervisors = [project.first_supervisor, project.second_supervisor]
    .filter(Boolean)
    .map(escapeHtml)
    .join(' & ');

  const tag = url ? 'a' : 'div';
  const hrefAttr = url ? ` href="${url}"` : '';

  return `
    <${tag} class="card" data-equalizer-watch${hrefAttr}>
      <figure class="card-image">
      ${image}
      </figure>
      <div class="card-section">
        <h3 class="card-headline">${name}</h3>
        ${authorCode}
      </div>
    </${tag}>`;
};

const INITIAL_COUNT = 12;
const BATCH_SIZE = 12;

const renderProjects = (projectsContainer, projects) => {
  const sorted = sortByDateDesc(projects);
  sorted.forEach((project) => {
    project._searchIndex = buildSearchIndex(project);
  });

  let visibleCount = INITIAL_COUNT;
  let filtered = sorted;

  projectsContainer.innerHTML = `
    <div class="mi-project-search has-extra-foot-space">
      <label class="mi-project-search-label" for="js-project-search">Arbeiten durchsuchen</label>
      <svg class="mi-project-search-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
        <circle cx="10.5" cy="10.5" r="7" fill="none" stroke="currentColor" stroke-width="2"></circle>
        <line x1="15.5" y1="15.5" x2="21" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
      </svg>
      <input type="search" id="js-project-search" class="mi-project-search-input"
        placeholder="z.B. Thema, Betreuer:in oder Jahr" data-js-search autocomplete="off">
    </div>
    <p class="mi-project-search-empty" data-js-search-empty hidden>Keine Arbeiten gefunden.</p>
    <div class="mi-project-overview" data-js-project-grid></div>
    <div class="mi-load-more" data-js-load-more-wrapper>
      <button type="button" class="a-mi-button" data-js-load-more>Weitere Arbeiten laden</button>
    </div>`;

  const searchInput = projectsContainer.querySelector('[data-js-search]');
  const emptyMessage = projectsContainer.querySelector('[data-js-search-empty]');
  const grid = projectsContainer.querySelector('[data-js-project-grid]');
  const loadMoreWrapper = projectsContainer.querySelector('[data-js-load-more-wrapper]');
  const loadMoreButton = projectsContainer.querySelector('[data-js-load-more]');

  const render = () => {
    const visible = filtered.slice(0, visibleCount);
    grid.innerHTML = visible.map(renderProjectCard).join('');
    loadMoreWrapper.hidden = visibleCount >= filtered.length;
    emptyMessage.hidden = filtered.length > 0;
  };

  const applyFilter = (query) => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    filtered = terms.length
      ? sorted.filter((project) => matchesQuery(project, terms))
      : sorted;
    visibleCount = INITIAL_COUNT;
    render();
  };

  searchInput.addEventListener('input', (event) => {
    applyFilter(event.target.value);
  });

  loadMoreButton.addEventListener('click', () => {
    visibleCount += BATCH_SIZE;
    render();
  });

  render();
};

/* Data
############################################################################ */
const addProjects = (projectsContainer) => {
  fetch(projectsDataUrl)
    .then((response) => response.json())
    .then((data) => {
      const projects = (data && data.projects) || [];
      if (!projects.length) return;
      renderProjects(projectsContainer, projects);
    })
    .catch((error) => {
      console.error('Projekte konnten nicht geladen werden:', error);
    });
};

/* Main
############################################################################ */
document.addEventListener('DOMContentLoaded', function () {
  const projectsContainer = document.querySelector('[data-js-projects]');
  if (!projectsContainer) return;
  addProjects(projectsContainer);
});
