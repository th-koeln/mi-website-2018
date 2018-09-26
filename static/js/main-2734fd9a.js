$(document).foundation();

$(document).ready(() => {

  // SEARCH WONT WORK if this isnt set correctly
  // path prefix, empty if the page lies in the root directory
  const prefix = "/mi-website-2018";

  // define indizes
  let lunrIndex, hugoIndex;

  // get jquery object for autocomplete
  let $autocomplete = $('.search--autocomplete');

  // get jquery object for clearing
  let $clear = $('.search--clear');

  // get data from hugo-lunr
  $.getJSON(prefix + '/js/lunr.json')
    .done(function(data) {

      // assign data for reuse
      hugoIndex = data;

      // build lunr index
      lunrIndex = lunr(function() {

        // title is a field and 10x more important then content
        this.field("title", { boost: 10 });

        // content is a field
        this.field("content");

        // uri is key
        this.ref("uri");

        // iterate over hugo index and build lunr index
        hugoIndex.forEach(function (page) {
            this.add(page)
        }, this)
      });
    });

    // clear input and autocomplete on click
    $clear.click(function(event) {
      $('.search--form input').val('');

      $autocomplete.empty();

      $clear.addClass('hide');
    });

    // key up on search input
    $('.search--form input').keyup(function() {

      // get query
      let query = $(this).val();

      $autocomplete.empty();

      // is there any input?
      if(query !== '') {

        // we have input, display clear option
        $clear.removeClass('hide');

        // map index results to hugo result objects to display data later
        let results = lunrIndex.search(query).map(function(result) {
          return hugoIndex.filter(function(page) {
            return page.uri === result.ref;
          })[0];
        });

        // we are only using max 5 results
        results.splice(5);

        // create ordered list
        let ol = $('<ol/>')
          .addClass('search--results')
          .appendTo($autocomplete);

        // iterate over results to add to list
        $.each(results, function(i, element) {

          // adding list item
          let li = $('<li/>')
            .addClass('search--result')
            .appendTo(ol)

          // fix up uri ( uri is actually filepath)
          let uri = element.uri
            .replace('/content', prefix)
            .replace('_index', '')
            .replace('/index', '/')
            .toLowerCase();

          // adding anchor with result data
          let a = $('<a/>')
            .attr('href', uri)
            .text(element.title)
            .appendTo(li);
        });

      } else {
        $clear.addClass('hide');
      }

    });
});
