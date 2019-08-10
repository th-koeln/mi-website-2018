"use strict";

$(document).foundation();
/* Main
-----------------------------------------------------------------------------*/

document.onreadystatechange = function () {
  if (document.readyState == "complete") {
    if (document.querySelector("#eventblock")) {
      createNews();
    }
  }
};

function createNews() {
  var newsUrls = ['https://th-koeln.github.io/mi-master-wtw/pulse.json', '/events/index.json'];
  var schema = [{
    "title": "string",
    "termin": "string",
    "date": "date",
    "bild": "url"
  }];
  var target = document.querySelector("#eventblock");
  var promises = [];
  var data = [];

  function getResource(url) {
    return new Promise(function (resolve, reject) {
      fetch(url).then(function (response) {
        return response.json();
      }).then(function (json) {
        json.forEach(function (item) {
          console.log(item);
        });
      }).then(function (json) {
        json.forEach(function (item) {
          data.push(item);
        });
      }).then(function () {
        return resolve(true);
      });
    });
  }

  function sortItems() {
    data.sort(function (a, b) {
      var aTime = new Date(a.date).getTime();
      var bTime = new Date(b.date).getTime();
      return bTime - aTime;
    });
  }

  function displayItems() {
    target.innerHTML = "";
    data.forEach(function (item) {
      var html = '<div class="cell medium-6 large-4 xxxlarge-3"><a href="' + item.url + '"><div class="m-mi-pulse-teaser has-image" style="background-image: url(' + item.bild + ')"><div class="m-mi-pulse-teaser--content"><h2 class="title">' + item.title + '</h2></div><p class="m-mi-pulse-teaser--footer">' + item.termin + '</p></div></a></div>';
      target.innerHTML += html;
    });
  }

  newsUrls.forEach(function (url) {
    promises.push(getResource(url)); //promises.push(validateSchema());
  });
  Promise.all(promises).then(function () {
    return sortItems();
  }).then(function () {
    return displayItems();
  });
}
//# sourceMappingURL=mi-b1771fe0.js.map
