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
            let aTime = new Date(a.date).getTime();
            let bTime = new Date(b.date).getTime();
            return bTime - aTime;
        });
    }

    function displayItems() {
        target.innerHTML = '';
        data.forEach(function(item) {
            target.innerHTML += `
                <a href="${item.url}">
                    <div class="m-mi-pulse-teaser has-image" style="background-image: url(${item.bild})">
                        <div class="m-mi-pulse-teaser--content">
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