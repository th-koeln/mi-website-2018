document.addEventListener('DOMContentLoaded', () => {
    const lunr = require('lunr');
    const createNews = require('./news.js');
    
    if (document.querySelector('#eventblock')) {  
        createNews();
    }

    const search = document.getElementById('search');
    const autocomplete = document.getElementById('autocomplete');
    let documents = [];
    let index;
    
    fetch('/index.json').then(function (res) {
        return res.json();
    }).then(function (res) {
        index = lunr(function() {
            this.ref('uri');
            this.field('title');
            //this.field('contentIndex');

            res.forEach(function(doc) {
                this.add(doc);
                documents[doc.uri] = {
                    'title': doc.title,
                    'content': doc.contentIndex,
                    'url': doc.uri
                };
            }, this);
        });
    });

    search.addEventListener('input', (event) => {
        const searchString = event.target.value;
        const matches = index.search(searchString);
        
        autocomplete.classList.add('show');
        
        if(matches.length > 0) {
            const output = matches.map((item) => {
                return documents[item.ref];
            }).reduce((acc, value) => {
                return acc + `<li class="search__item">
                                <a href="${value.url}">${value.title}</a>
                                </li>`; 
            }, '');
            autocomplete.innerHTML = output;
        }
    });
    
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

    /** toggle tabs */
    const tabs = document.querySelectorAll('[data-tabs] a');
    const toggleTab = (event) => {
        event.preventDefault();

        const content = document.querySelectorAll('[data-tabs] + [data-tabs-content] .tabs-panel');

        content.forEach((tabContent) => {
            if(tabContent.id === event.target.hash.substring(1)) {
                tabContent.classList.add('is-active');
            } else {
                tabContent.classList.remove('is-active');
            }
        });
    };

    for(let tab of tabs) {
        tab.addEventListener('click', toggleTab);
    }
});
