function createNews() {

    const newsUrls = ['https://th-koeln.github.io/mi-master-wtw/pulse.json', '/events/index.json'];
    const rssUrl = 'http://localhost:1313/temp/rss-mock.xml';
    // 'https://ilu.th-koeln.de/feed.php?blog_id=176593_cll&client_id=thkilu';

    const target = document.querySelector('#eventblock');
    let promises = [];
    let data = [];

    function getJSONResource(url) { 
        return new Promise((resolve) => {
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

    function getRSSFromILU(){
        return new Promise((resolve) => {
            fetch(rssUrl)
                .then(response => response.text())
                .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
                .then(xmlDoc => {
                    const items = xmlDoc.getElementsByTagName("item");
                    let random = 1;
                    for (item of items) {
                        const obj = {
                            title: item.getElementsByTagName("title")[0].innerHTML,
                            url: item.getElementsByTagName("link")[0].innerHTML,
                            content: item.getElementsByTagName("description")[0].innerHTML
                                .replace(/<!\[CDATA\[/g, '')
                                .replace(/\]\]>/g, '')
                                .replace(/(<([^>]+)>)/gi, ""),
                            termin: '',
                            date: new Date(item.getElementsByTagName("pubDate")[0].innerHTML),
                            bild: `https://loremflickr.com/g/640/480/cologne#jpg/?random=${random++}`
                        };
                        data.push(obj);
                    };
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
        let teaserImageCode = '<div class="m-mi-pulse-teaser--image"><img src="' + item.bild + '"></div>';
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
        promises.push(getJSONResource(url));
    });

    promises.push(getRSSFromILU());
  
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
