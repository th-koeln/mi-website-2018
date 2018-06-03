import gulp from 'gulp';
import sass from 'gulp-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import hash from 'gulp-hash';
import concat from 'gulp-concat';
import purgecss from 'gulp-purgecss';
import sourcemaps from 'gulp-sourcemaps';
import notify from 'gulp-notify';
import plumber from 'gulp-plumber';
import postcssPresetEnv from 'postcss-preset-env';
import vinylPaths from 'vinyl-paths';

// import cleanCSS from 'gulp-clean-css';
import del from 'del';

const theme = "themes/micgn/layouts/partials/";
const docs = "docs/";
const paths = {
  styles: {
    src: ["src/scss/*.scss", theme + "**/*.scss"],
    tmp: 'src/tmp/',
    stat: 'static/css/',
    dest: 'data/css/'
  },
  js: {
    src: ["src/js/**/*.js",  theme + "**/*.js"],
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
	  dest: "static/css/",
  }
};

const postCssPlugins = [
	autoprefixer({browsers: ['last 20 versions']}),
	postcssPresetEnv
];

function clean( path ) {
  del(path)
}

export function images() {
	clean(paths.images.stat);
	return gulp.src(paths.images.src)
		.pipe(hash())
		.pipe(gulp.dest(paths.images.stat))
		.pipe(hash.manifest("hash.json"))
		.pipe(gulp.dest(paths.images.dest));
}

export function js() {
	clean(paths.js.stat);
	clean(paths.js.dest);
	return gulp.src(paths.js.src)
		.pipe(concat('main.js'))
		.pipe(hash())
		.pipe(gulp.dest(paths.js.stat))
		.pipe(hash.manifest("hash.json"))
		.pipe(gulp.dest(paths.js.dest))
}

export function purge() {
	return gulp.src(paths.purge.src)
		.pipe(
			purgecss({
				content: paths.purge.content
		})
		)
		.pipe(gulp.dest(paths.purge.dest))
}

export function renderSassFiles() {
	clean(paths.styles.stat);
	clean(paths.styles.dest);
	return gulp.src(paths.styles.src)
	.pipe(gulp.dest(paths.styles.tmp))
	.pipe(concat('mi.scss'))
	.pipe(sass({outputStyle: "compressed" }))
	.pipe(hash())
	.pipe(sourcemaps.init())
	.pipe(postcss(postCssPlugins))
	.pipe(sourcemaps.write('.'))
	.pipe(gulp.dest(paths.styles.stat))
	.pipe(hash.manifest("hash.json"))
	.pipe(gulp.dest(paths.styles.dest))
}

function watchFiles() {
  gulp.watch(paths.js.src, js);
  gulp.watch(paths.styles.src, renderSassFiles);
}

export const styles = gulp.series(renderSassFiles);
export const all = gulp.series(styles, js, purge);
export default watchFiles;