document.addEventListener('DOMContentLoaded', () => {

    /** Toogle Main Menu  */
    const mainMenu = document.getElementById('icon-main-menu');

    const openSidebar = () => {
        const sidebar = document.getElementById('offCanvas');
        const content = document.querySelectorAll('#offCanvas + .off-canvas-content')[0];
    
        if(sidebar) {
            sidebar.classList.toggle('is-open');
        }
    
        if(content) {
            content.classList.toggle('is-open');
        }
    };
    
    if(mainMenu) {
        mainMenu.addEventListener('click', openSidebar);
    }
    
    /** Toggle Accordion */
    const accordionTitles = document.querySelectorAll('.accordion-title');
    
    const toggleAccordion = (event) => {
        event.preventDefault();

        const title = event.currentTarget;
        title.classList.toggle('active');

        const content = title.nextElementSibling;
        content.classList.toggle('active');
    };
    
    for(let title of accordionTitles) {
        title.addEventListener('click', toggleAccordion);
    }

    /** Toggle Callout */
    const calloutToggleList = document.querySelectorAll('[data-callout]');
    const toggleCallout = (event) => {
        event.preventDefault();
        const target = event.currentTarget.dataset.callout;

        const callout = document.getElementById(target);
        callout.classList.toggle('is-hidden');
    };

    for(let toggle of calloutToggleList) {
        toggle.addEventListener('click', toggleCallout);
    }

    /** Close Callout */
    const closeCalloutList = document.querySelectorAll('[data-close]');
    const closeCallout = (event) => {
        event.preventDefault();
        
        const target = event.currentTarget.dataset.close;
        
        const callout = document.getElementById(target);
        callout.classList.add('is-hidden');
    };

    for(let close of closeCalloutList) {
        close.addEventListener('click', closeCallout);
    }
});
