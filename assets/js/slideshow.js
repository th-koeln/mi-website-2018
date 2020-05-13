function slideshow() {
    const slideshows = document.querySelectorAll('.js-slideshow');
    console.log(slideshows);
}

document.onreadystatechange = function () {
    if (document.readyState == 'complete') {
        slideshow();
    }
};
