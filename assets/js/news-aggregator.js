function createNews() {

    const newsUrls = ['https://th-koeln.github.io/mi-master-wtw/pulse.json', '/events/index.json'];
    
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

    function displayItems() {
        // only show a couple items
        data = data.slice(0, 116);
        
        target.innerHTML = '';
      data.forEach(function (item) {
        
        let external = (!item.url.includes(getCurrentUrl())) ? '<i class="material-icons m-mi-pulse-teaser--external">open_in_new</i>' : '';
        let teaserImageCode = '<div class="m-mi-pulse-teaser--image"><img src="' + item.bild + '" alt="'+item.title+'"></div>';
        let teaserImage = (item.bild.match(/jpg|jpeg|png|webP|j2/)) ? teaserImageCode  : "";
        
        target.innerHTML += `
        <a href="${item.url}">
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
        .then(() => sortItems())
        .then(() => displayItems());
}

document.onreadystatechange = function () {
    if (document.readyState == 'complete') {
        if (document.querySelector('#eventblock')) {
            createNews();
        }
    }
};
