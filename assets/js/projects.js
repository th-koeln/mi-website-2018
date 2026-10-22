const projectsDataUrl = 'https://www.medieninformatik.th-koeln.de/project-data.php';

// Query-Parameter, über den die Projektseite eine interne Detailansicht
// rendert, z. B. /projects/?projekt=semantic-motion-in-web-uis
const projectDetailParam = 'projekt';

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

// Nur http(s)-Links durchlassen, damit aus dem JSON kein javascript: o. Ä.
// im href landet.
const safeUrl = (value) => {
  if (!value) return '';
  return /^https?:\/\//i.test(String(value).trim()) ? String(value).trim() : '';
};

// Slug aus dem Titel, z. B. "Semantic Motion in Web UIs" → "semantic-motion-in-web-uis"
const slugify = (value) => {
  return String(value || '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const isInternalProject = (project) => {
  return Boolean(project.detail && project.detail.mode === 'internal');
};

// Ziel einer Projektkarte: interne Projekte auf die eigene Detailansicht,
// externe auf detail.url, ohne detail-Knoten wie bisher auf url.
const projectHref = (project) => {
  if (isInternalProject(project)) {
    const slug = encodeURIComponent(slugify(project.name));
    return `${window.location.pathname}?${projectDetailParam}=${slug}`;
  }
  if (project.detail && project.detail.mode === 'external' && project.detail.url) {
    return project.detail.url;
  }
  return project.url;
};

/* Markdown
############################################################################ */
// Bewusst kleiner Markdown-Konverter für das Abstract: Absätze, Überschriften,
// Listen, Zitate, fett, kursiv, Code und Links. Der Text wird vorher
// escaped, rohes HTML aus dem JSON landet also nie im DOM.
const renderInlineMarkdown = (text) => {
  const codeSpans = [];
  let html = escapeHtml(text).replace(/`([^`]+)`/g, (match, code) => {
    codeSpans.push(`<code>${code}</code>`);
    return `\u0000${codeSpans.length - 1}\u0000`;
  });

  html = html
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label, url) => {
      const href = safeUrl(url.replace(/&amp;/g, '&'));
      return href ? `<a href="${escapeHtml(href)}">${label}</a>` : label;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/(^|[^\w])_([^_]+)_(?!\w)/g, '$1<em>$2</em>');

  return html.replace(/\u0000(\d+)\u0000/g, (match, index) => codeSpans[index]);
};

const renderMarkdown = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split('\n').map((line) => line.trim());

      const heading = block.match(/^(#{1,6})\s+(.*)$/);
      if (heading && lines.length === 1) {
        // h1 ist der Projekttitel, Überschriften im Abstract rücken eine Ebene nach unten
        const level = Math.min(heading[1].length + 1, 6);
        return `<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`;
      }

      if (lines.every((line) => /^[-*+]\s+/.test(line))) {
        const items = lines.map((line) => `<li>${renderInlineMarkdown(line.replace(/^[-*+]\s+/, ''))}</li>`);
        return `<ul>${items.join('')}</ul>`;
      }

      if (lines.every((line) => /^\d+[.)]\s+/.test(line))) {
        const items = lines.map((line) => `<li>${renderInlineMarkdown(line.replace(/^\d+[.)]\s+/, ''))}</li>`);
        return `<ol>${items.join('')}</ol>`;
      }

      if (lines.every((line) => line.startsWith('>'))) {
        const quote = lines.map((line) => line.replace(/^>\s?/, '')).join(' ');
        return `<blockquote><p>${renderInlineMarkdown(quote)}</p></blockquote>`;
      }

      return `<p>${renderInlineMarkdown(lines.join(' '))}</p>`;
    })
    .join('\n');
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
  const url = escapeHtml(projectHref(project));
  const type = escapeHtml(project.type);
  const author = escapeHtml(project.author);

  const image = project.image
    ? `<span class="a-mi-lqip is-remote"><img class="a-mi-lqip__image" loading="lazy" decoding="async" src="${escapeHtml(project.image)}" alt="${name}"></span>`
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

/* Detailansicht (detail.mode = "internal")
############################################################################ */
// awards und socialMedia können Strings oder Objekte sein; beides wird zu
// { label, url } vereinheitlicht.
const toLinkItem = (entry) => {
  if (!entry) return null;
  if (typeof entry === 'string') {
    const url = safeUrl(entry);
    return { label: entry, url };
  }
  const url = safeUrl(entry.url || entry.link || entry.href);
  const label = entry.title || entry.name || entry.label || entry.platform || url;
  return label ? { label, url } : null;
};

const renderLinkItem = (item) => {
  const label = escapeHtml(item.label);
  return item.url ? `<a href="${escapeHtml(item.url)}">${label}</a>` : label;
};

const renderProjectDetail = (detailContainer, project) => {
  const name = escapeHtml(project.name);
  const type = escapeHtml(project.type);
  const author = escapeHtml(project.author);
  const monthYear = escapeHtml(formatMonthYear(project.date || project.updatedAt));

  const subtitle = [type && author ? `${type} von ${author}` : type || author, monthYear]
    .filter(Boolean)
    .join(', ');

  // Markup wie molecules/mi-hero-image + atoms/mi-headline-invers (Blogartikel).
  // Die Parallax läuft rein über CSS und greift deshalb auch hier.
  const imageUrl = safeUrl(project.image);
  const subtitleCode = subtitle ? `<br><h2 class="a-subtitle-invers">${subtitle}</h2>` : '';
  const hero = imageUrl
    ? `<div class="m-mi-hero-image">
        <div class="a-mi-parallax" style="aspect-ratio: 16 / 9;">
          <div class="a-mi-parallax__layer">
            <img src="${escapeHtml(imageUrl)}" alt="${name}" class="m-mi-hero-image__image a-mi-parallax__image" loading="eager" fetchpriority="high">
          </div>
        </div>
        <header class="title">
          <h1 class="a-headline-invers">${name}</h1>
          ${subtitleCode}
        </header>
      </div>`
    : `<h1>${name}</h1>${subtitle ? `<p class="is-small">${subtitle}</p>` : ''}`;

  const keywords = (project.keywordsList && project.keywordsList.length)
    ? project.keywordsList.join(', ')
    : project.keywords;

  const partnerUrl = safeUrl(project.partnerUrl);
  const partner = project.partner
    ? (partnerUrl ? `<a href="${escapeHtml(partnerUrl)}">${escapeHtml(project.partner)}</a>` : escapeHtml(project.partner))
    : '';

  const awards = (project.awards || []).map(toLinkItem).filter(Boolean);
  const social = (project.socialMedia || []).map(toLinkItem).filter(Boolean);

  // Link als normaler Text; ohne eigenes Label wird die URL ohne Protokoll gezeigt
  const textLink = (url, label) => {
    const href = safeUrl(url);
    if (!href) return '';
    const text = label || href.replace(/^https?:\/\//i, '').replace(/\/$/, '');
    return `<a href="${escapeHtml(href)}">${escapeHtml(text)}</a>`;
  };

  const youtubeUrl = project.youtubeId
    ? `https://www.youtube.com/watch?v=${encodeURIComponent(project.youtubeId)}`
    : '';

  const facts = [
    ['Art der Arbeit', type],
    ['Autor:in', author],
    ['Abgabe', monthYear],
    ['Erstprüfer:in', escapeHtml(project.first_supervisor)],
    ['Zweitprüfer:in', escapeHtml(project.second_supervisor)],
    ['Partner', partner],
    ['Keywords', escapeHtml(keywords)],
    ['Auszeichnungen', awards.map(renderLinkItem).join(', ')],
    ['Download', textLink(project.thesisUrl, 'Arbeit als PDF')],
    ['Repository', textLink(project.repositoryUrl)],
    ['Projekt', textLink(project.projectUrl)],
    ['Website', textLink(project.website)],
    ['Video', textLink(youtubeUrl, 'Auf YouTube ansehen')],
    ['Social Media', social.map(renderLinkItem).join(', ')],
    ['Bildnachweis', escapeHtml(project.imageCopyright)],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`)
    .join('');

  detailContainer.innerHTML = `
    ${hero}
    <div class="m-mi-textblock">
      ${renderMarkdown(project.abstract)}
    </div>
    ${facts ? `
    <div class="m-mi-textblock mi-project-detail__facts">
      <dl>${facts}</dl>
    </div>` : ''}`;

  document.title = `${project.name} | ${document.title}`;
};

const renderProjectNotFound = (detailContainer) => {
  detailContainer.innerHTML = `
    <h1>Arbeit nicht gefunden</h1>
    <div class="m-mi-textblock">
      <p>Diese Arbeit gibt es nicht (mehr) oder der Link ist fehlerhaft.</p>
      <p><a href="${escapeHtml(window.location.pathname)}">Alle Projekte ansehen</a></p>
    </div>`;
};

/* Data
############################################################################ */
const fetchProjects = () => {
  return fetch(projectsDataUrl)
    .then((response) => response.json())
    .then((data) => (data && data.projects) || []);
};

const addProjects = (projectsContainer) => {
  fetchProjects()
    .then((projects) => {
      if (!projects.length) return;
      renderProjects(projectsContainer, projects);
    })
    .catch((error) => {
      console.error('Projekte konnten nicht geladen werden:', error);
    });
};

const addProjectDetail = (detailContainer, slug) => {
  fetchProjects()
    .then((projects) => {
      const project = projects.find((item) => isInternalProject(item) && slugify(item.name) === slug);
      if (project) {
        renderProjectDetail(detailContainer, project);
      } else {
        renderProjectNotFound(detailContainer);
      }
    })
    .catch((error) => {
      console.error('Projekt konnte nicht geladen werden:', error);
      renderProjectNotFound(detailContainer);
    });
};

/* Main
############################################################################ */
document.addEventListener('DOMContentLoaded', function () {
  const projectsContainer = document.querySelector('[data-js-projects]');
  if (!projectsContainer) return;

  const detailSlug = new URLSearchParams(window.location.search).get(projectDetailParam);
  const detailContainer = document.querySelector('[data-js-project-detail]');

  if (detailSlug && detailContainer) {
    // Intro und Übersicht ausblenden, stattdessen die Detailansicht zeigen
    document.querySelectorAll('[data-js-projects-intro]').forEach((element) => {
      element.hidden = true;
    });
    projectsContainer.hidden = true;
    detailContainer.hidden = false;
    addProjectDetail(detailContainer, slugify(detailSlug));
    return;
  }

  addProjects(projectsContainer);
});
