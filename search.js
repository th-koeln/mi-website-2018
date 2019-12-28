const glob = require('glob');
const fs = require('fs').promises;
const lunr = require('lunr');
const frontmatter = require('front-matter');

const readPagesFromDirectory = (path) => {
    return new Promise((resolve, reject) => {
        glob(path, (err, files) => {
            if(err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    });
};

const readFiles = async (paths) => {
    const files = paths.map((path) => {
        return fs.readFile(path, 'utf-8');
    });
    return await Promise.all(files);
};

const getPages = async () => {
    const paths = await readPagesFromDirectory('content/**/*.md');
    return await readFiles(paths);
};

const normalize = (page) => {
    if(page && page.body) {
        page.body = page.body.replace(/(\r\n|\n|\r)/gm, ' ');
    }

    let reducedObject = {};

    if(page && page.attributes) {
        reducedObject = { ...reducedObject, ...page.attributes };
    }

    reducedObject.body = page.body;

    return reducedObject;
};

const buildIndex = async () => {
    let pages = await getPages();

    pages = pages.map((page) => {
        page = frontmatter(page);
        return normalize(page);
    });

    const index = lunr(function() {
        this.ref('title');
        this.field('title');
        this.field('body');
        this.metadataWhitelist = ['position'];

        pages.forEach(function (page) {
            this.add(page);
        }, this);
    });

    // eslint-disable-next-line
    console.log(JSON.stringify(index));
};

buildIndex();
