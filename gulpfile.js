const gulp = require('gulp');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const minify = require('gulp-babel-minify');
const sourcemaps = require('gulp-sourcemaps');
const cleanCSS = require('gulp-clean-css');
const babel = require('gulp-babel');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const del = require('del');

const paths = {
    styles: {
        src: [
            'static/scss/mi-vars.scss',
            'static/scss/**/*.scss',
            'layouts/**/*.scss'
        ],
        dest: 'static/css/dist/'
    },
    js: {
        src: [
            'static/js/**/*.js',
            '!static/js/dist/',
            '!static/js/dist/**',
            'layouts/**/*.js'
        ],
        dest: 'static/js/dist/'
    }
};

gulp.task('styles', () => {
    return gulp.src(paths.styles.src)
        .pipe(concat('mi.scss'))
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(rename('mi.min.css'))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.styles.dest));
});

gulp.task('js', () => {
    const b = browserify({
        entries: 'static/js/main.js',
        debug: true,
    });

    return b.bundle()
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init())
        .pipe(concat('mi.js'))
        .pipe(babel({ presets: ['@babel/env'] }))
        .pipe(minify({mangle: { keepClassName: true } }))
        .pipe(sourcemaps.write())
        .pipe(rename('mi.min.js'))
        .pipe(gulp.dest(paths.js.dest));
});

gulp.task('clean', () => {
    return del([
        paths.styles.dest + '*.css',
        paths.js.dest + '*.js'
    ]);
});

gulp.task('default', gulp.series(['clean', 'js', 'styles']));

gulp.task('watch', () => {
    const sources = paths.styles.src.concat(paths.js.src);
    gulp.watch(sources, (done) => {
        gulp.series(['clean', 'js', 'styles'])(done);
    });
});
