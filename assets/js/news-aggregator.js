const newsUrls = ['https://th-koeln.github.io/mi-master-wtw/pulse.json', '/events/index.json'];
const displayMax = 16;

const showAdditionalNews = () => {
    const areThereMoreNews = document.querySelectorAll(".news-item").length > displayMax;
    if(!areThereMoreNews) return;
    
    const targetContainer = document.querySelector('#eventblock');
    if(!targetContainer) return;
  
    targetContainer.insertAdjacentHTML("beforeend", `<button class="more-events-button m-mi-pulse-teaser" data-js-show-more-news class="button">Weitere Events anzeigen</button>`);
  
    const showMoreButton = document.querySelector("[data-js-show-more-news]");
    if(!showMoreButton) return;
  
    showMoreButton.addEventListener("click", () => {
      const hiddenItems = document.querySelectorAll(".news-item.is-hidden");
      hiddenItems.forEach(item => {
        item.classList.remove("is-hidden");
        item.classList.add("is-visible");
      });
      showMoreButton.style.display = "none";
    });
  };
  
  function createNews() {
    const target = document.querySelector('#eventblock');
    let promises = [];
    let data = [];

    function getResource(url) { 
        return new Promise((resolve, reject) => {
            fetch(url)
                .then(response => {
                    return response.json();
                })
                .then(json => {
                    json.forEach(function(item) {
                        data.push(item);
                    });
                })
                .then(() => resolve(true));  
        });
    }

    function cleanItems() {

        const cleanData = [];

        data.forEach(item => {
            item.date = item.date.replace(/T.*/, '');
        });
    }

    function sortItems() {
        data.sort(function(a, b) {
            let aTime = new Date(a.date);
            let bTime = new Date(b.date);
            return bTime - aTime;
        });
    }

    function getCurrentUrl() {
        if(window.location.href.startsWith('https')) {
            return window.location.href.substring(5);
        }
        return window.location.href.substring(4);
    }

    function getTeaserImage(item){
        if(item.decapBild && item.decapBild.match(/jpg|jpeg|png|webP|j2/)) return `${item.ref}/${item.decapBild}`;
        if(item.bild && item.bild.match(/jpg|jpeg|png|webP|j2/)) return item.bild;
        return false;
    }

    function displayItems() {
        // only show a couple items
        const news = data.slice(0, 100);

        target.innerHTML = '';
        news.forEach(function (item, index) {
            let bild = getTeaserImage(item);
            
            let external = (!item.url.includes(getCurrentUrl())) ? '<i class="material-icons m-mi-pulse-teaser--external">open_in_new</i>' : '';
            let teaserImageCode = '<div class="m-mi-pulse-teaser--image"><img loading="lazy" src="' + bild + '" alt="'+item.title+'"></div>';
            let teaserImage = (bild && bild.match(/jpg|jpeg|png|webP|j2/)) ? teaserImageCode  : "";
            
            const visibilityClass = index < displayMax ? 'is-visible' : 'is-hidden';

            target.innerHTML += `
                <a href="${item.url}" class="news-item ${visibilityClass}">
                    <div class="m-mi-pulse-teaser has-image">
                        ${teaserImage}
                        <div class="m-mi-pulse-teaser--content">
                            ${external}
                            <h2 class="title">${item.title}</h2>
                        </div>
                        <p class="m-mi-pulse-teaser--footer">
                            ${item.termin}
                        </p>
                    </div>
                </a>`;
            });
    }

    newsUrls.forEach(function(url) {
        promises.push(getResource(url));
    });
  
    Promise.all(promises)
        .then(() => cleanItems())
        .then(() => sortItems())
        .then(() => displayItems())
        .then(() => showAdditionalNews())
}

document.onreadystatechange = function () {
    if (document.readyState == 'complete') {
        if (document.querySelector('#eventblock')) {
            createNews();
        }
    }
};
