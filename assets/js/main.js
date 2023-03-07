class Studienverlaufsplan {
    constructor() {
        this.init();
        this.element = false;
        this.map = {
            "ap-1": "/study/bachelor/moduls/ba_algorithmenundprogrammierung1/",
            "ap-2": "/study/bachelor/moduls/ba_algorithmenundprogrammierung2/",
            "avm": "/study/bachelor/moduls/ba_avm/",
            "bwl": "/study/bachelor/moduls/ba_bwl1/",
            "bak": "/study/bachelor/moduls/ba_bachelorkolloquium/",
            "ba": "/study/bachelor/moduls/ba_bachelorarbeit/",
            "cga": "/study/bachelor/moduls/ba_vc-computergrafik-und-animation/",
            "db": "/study/bachelor/moduls/ba_datenbanken1/",
            "ebr": "/study/bachelor/moduls/ba_einfhrunginbetriebssystemeundrechnerarchitektur/",
            "emi": "/study/bachelor/moduls/ba_einfhrungindiemedieninformatik/",
            "ep": "/study/bachelor/moduls/ba_entwicklungsprojekt/",
            "gdw": "/study/bachelor/moduls/ba_grundlagen-des-web/",
            "kt": "/study/bachelor/moduls/ba_kommunikationstechnikundnetze/",
            "ma-1": "/study/bachelor/moduls/ba_mathematik1/",
            "ma-2": "/study/bachelor/moduls/ba_mathematik2/",
            "iug": "/study/bachelor/moduls/ba_mug/",
            "mci": "/study/bachelor/moduls/ba_mensch-computer_interaktion/",
            "mc": "/study/bachelor/moduls/ba_mobile-computing/",
            "pdp": "/study/bachelor/moduls/ba_paradigmen-der-programmierung/",
            "pp": "/study/bachelor/moduls/ba_praxisprojekt/",
            "pps": "/study/bachelor/moduls/ba_praxisprojektseminar/",
            "pm": "/study/bachelor/moduls/ba_projektmanagement/",
            "sd": "/study/bachelor/moduls/ba_screendesign/",
            "st": "/study/bachelor/moduls/ba_softwaretechnik/", 
            "ti-1": "/study/bachelor/moduls/ba_theoretischeinformatik1/",
            "ti-2": "/study/bachelor/moduls/ba_theoretischeinformatik2/",
            "sc": "/study/bachelor/moduls/ba_vertiefung_socialcomputing/",
            "vc": "/study/bachelor/moduls/ba_vertiefung-visual-computing/",
            "wd": "/study/bachelor/moduls/ba_vertiefung-web_development/",
            "wpf": "/study/bachelor/moduls/ba_wpf/",
        };
    }

    goto(modul){
        const rawId = modul.id;
        if(!rawId) return;
        
        const id = rawId.replace('modul-', '');

        if(!this.map[id]) return;
        location.href = this.map[id];
        return;
    }

    init() {
        const studienverlaufsplanNode = document.getElementById('studienverlaufsplan-bachelor');
        if(studienverlaufsplanNode === null) return;
        this.element = studienverlaufsplanNode;

        this.element.querySelectorAll("[id*='modul']").forEach((modul) => {
            modul.addEventListener('click', (event) => {
                event.preventDefault();
                this.goto(modul)
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {

    /** Toogle Main Menu  */
    const mainMenu = document.getElementById('icon-main-menu');

    const openSidebar = () => {
        const sidebar = document.getElementById('offCanvas');
        const content = document.querySelectorAll('#offCanvas + .off-canvas-content')[0];
        const button = document.getElementById('icon-main-menu');

        if(sidebar) {
            sidebar.classList.toggle('is-open');
            button.classList.toggle('is-open');
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
  
  /** Get data-href **/
  document.querySelectorAll('[data-href]').forEach((ele) => {
    let href = ele.dataset.href;
  
    ele.addEventListener('click', () => {
      location.href = href;
    });
  });

  
  const studienverlaufsplan = new Studienverlaufsplan();
  studienverlaufsplan.init();

});
