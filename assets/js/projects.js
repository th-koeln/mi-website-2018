const projectsDataUrl = 'https://medieninformatik.th-koeln.de/api/projects?limit=6&sort=-edited';

const findParentWithClass = (element, className) => {
  let parent = element.parentElement;
  while (parent) {
    if (parent.classList.contains(className)) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
};

const addProjects = (projectsContainer) => {

  const projectsParent = findParentWithClass(projectsContainer, 'content');
  if (!projectsParent) return;

}

  /* Main
  ############################################################################ */
  document.addEventListener('DOMContentLoaded', function () {
    const projectsContainer = document.querySelector('[data-js-projects]');
    if (!projectsContainer) return;
    addProjects(projectsContainer);
  });
