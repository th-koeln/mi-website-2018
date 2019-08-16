const mainMenu = document.getElementById('icon-main-menu');

const openSidebar = (event) => {
    const sidebar = document.getElementById('offCanvas');
    const content = document.querySelectorAll('#offCanvas + .off-canvas-content')[0];

    if(sidebar) {
        sidebar.classList.toggle('is-open');
    }

    if(content) {
        content.classList.toggle('is-open');
    }
};

mainMenu.addEventListener('click', openSidebar);
