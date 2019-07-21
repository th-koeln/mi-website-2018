const gulp = require('gulp');
const sass = require('gulp-sass');
// const gulpPostcss = require('gulp-postcss');
// const autoprefixer = require('autoprefixer');
const hash = require('gulp-hash');
const concat = require('gulp-concat');
const purgecss = require('gulp-purgecss');
const sourcemaps = require('gulp-sourcemaps');
// const gulpNotify = require('gulp-notify');
// const gulpPlumber = require('gulp-plumber');
// const _postcssPresetEnv = require('postcss-preset-env');
// const vinylPaths = require('vinyl-paths');
const del = require('del');
const babel = require('gulp-babel');
const gulpStylelint = require('gulp-stylelint');

const partials = "themes/micgn/layouts/partials/";
const views    = "themes/micgn/layouts/_default/views/";

const docs = "docs/";
const paths = {
	styles: {
			src: ["src/scss/*.scss", partials + "**/*.scss", views + "**/*.scss"],
			tmp: 'src/tmp/',
			stat: 'static/css/',
			dest: 'data/css/'
	},
	js: {
    src: ["src/js/**/*.js", partials + "**/*.js", views + "**/*.js"],
    tmp: 'src/tmp/',
    stat: 'static/js/',
    dest: 'data/js/'
	},
	images: {
			src: 'static/images/**/*',
			stat: 'static/images/',
			dest: 'data/images/'
	},
	purge: {
			src: "static/css/*.css",
			content: [docs + "**/*.html"],
			dest: "static/css/"
	}
};

const sources = paths.styles.src
  .concat(paths.js.src);


gulp.task('styles', () => {
  return gulp.src(paths.styles.src)
    .pipe(gulp.dest(paths.styles.tmp))
    .pipe(sourcemaps.init())
    .pipe(concat('mi.scss'))
    .pipe(sass().on('error', sass.logError))
    .pipe(hash())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(paths.styles.stat))
    .pipe(hash.manifest("hash.json"))
    .pipe(gulp.dest(paths.styles.dest));
});

gulp.task('purge', () => {
  return gulp.src(paths.purge.src)
    .pipe(
      purgecss({
        content: paths.purge.content
      })
    )
    .pipe(gulp.dest(paths.purge.dest))
});

gulp.task('js', () => {
  return gulp.src(paths.js.src)
    .pipe(gulp.dest(paths.js.tmp))
    .pipe(sourcemaps.init())
    .pipe(concat('mi.js'))
    .pipe(babel({ presets: ['@babel/env'] }))
    .pipe(hash())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(paths.js.stat))
    .pipe(hash.manifest("hash.json"))
    .pipe(gulp.dest(paths.js.dest));
});

gulp.task('clean', () => {
  return del([
    paths.styles.tmp, paths.styles.dest, paths.styles.stat, paths.js.tmp, paths.js.dest, paths.js.stat
  ]);
});

gulp.task('default', gulp.series(['clean', 'js','styles', 'purge']));

gulp.task('watch', () => {
  gulp.watch(sources, (done) => {
      gulp.series(['clean', 'js','styles'])(done);
  });
});