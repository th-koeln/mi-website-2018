/* Blur-up: Bilder nach dem Laden einblenden
############################################################################ */
// load/error bubbeln nicht; in der Capture-Phase erreichen sie aber auch
// Bilder, die news-aggregator.js und projects.js erst später einfügen.
const lqipMarkLoaded = (event) => {
  const img = event.target;
  if (img.classList && img.classList.contains('a-mi-lqip__image')) {
    img.classList.add('is-loaded');
  }
};

document.addEventListener('load', lqipMarkLoaded, true);
document.addEventListener('error', lqipMarkLoaded, true);

// Bereits geladen (z. B. aus dem Cache): ohne Animation sofort zeigen
document.querySelectorAll('.a-mi-lqip__image').forEach((img) => {
  if (img.complete) {
    img.style.animation = 'none';
    img.classList.add('is-loaded');
  }
});
