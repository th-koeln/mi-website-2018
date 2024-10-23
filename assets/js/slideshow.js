

/* Conf
############################################################################ */
const snapsUrl = "/snaps/index.json";

/* Functions
############################################################################ */


const generateSlidesFromSnaps = async (slideshow) => {
    const tagsRaw = slideshow.getAttribute('data-tags');
    const tags = tagsRaw ? JSON.parse(tagsRaw) : [];
    const tagMode = slideshow.getAttribute('data-tag-mode') || 'some';
    
    const snaps = await fetch(snapsUrl).then(response => response.json());

    /* all tags must be included */
    const snapsFilteredEvery = snaps.filter(snap => {
        if(tags.length === 0) return true;
        return tags.every(tag => snap.tags.includes(tag));
    });

    /* at least one tag must be included */
    const snapsFilteredSome = snaps.filter(snap => {
        if(tags.length === 0) return true;
        return tags.some(tag => snap.tags.includes(tag));
    });

    const snapsFiltered = tagMode === 'every' ? snapsFilteredEvery : snapsFilteredSome;

    /* Shuffle snaps */
    const snapsFilteredShuffled = snapsFiltered.sort(() => Math.random() - 0.5);

    const slides = snapsFilteredShuffled.map((snap, index) => {
        const slide = document.createElement('a');
        slide.href = snap.ref + snap.decapBild;
        slide.dataset.pswpWidth = snap.width;
        slide.dataset.pswpHeight = snap.height;
        
        if(index > 0){
            slide.classList.add('is-hidden');
        }
        
        slide.classList.add('slideshow__slide');
        slide.innerHTML = `
            <figure>
                <img src="${snap.ref}${snap.decapBild}" alt="${snap.title}" class="slideshow__image">
                <figcaption>
                    <p class="bu">${snap.title}</p>
                    <p class="copyright">Photo: ${snap.autor}</p>
                </figcaption>
            </figure>
        `;
        return slide;
    });

    slides.forEach(slide => slideshow.appendChild(slide));


};

const addSlideshows = () => {
    const slideshows = document.querySelectorAll('.js-slideshow');

    slideshows.forEach(slideshow => {
        const type = slideshow.getAttribute('data-type');
        
        if(type === 'from-snaps') generateSlidesFromSnaps(slideshow);
    });
}

/* Main
############################################################################ */
document.addEventListener('DOMContentLoaded', function() {
    addSlideshows();
});
