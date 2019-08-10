const {dest, series, src, task, watch} = require('gulp');
const sass = require('gulp-sass');
const hash = require('gulp-hash');
const concat = require('gulp-concat');
const purgecss = require('gulp-purgecss');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const babel = require('gulp-babel');

const paths = {
	styles: {
		src: [
			'src/scss/*.scss',
			'layouts/partials/**/*.scss',
			'layouts/_default/views/**/*.scss'
		],
		tmp: 'src/tmp/',
		stat: 'static/css/',
		dest: 'data/css/'
	},
	js: {
		src: [
			'src/js/**/*.js',
			'layouts/partials/**/*.js',
			'layouts/_default/views/**/*.js'
		],
		tmp: 'src/tmp/',
		stat: 'static/js/deploy',
		dest: 'data/js/'
	},
	images: {
		src: 'static/images/**/*',
		stat: 'static/images/',
		dest: 'data/images/'
	},
	purge: {
		src: 'static/css/*.css',
		content: ['public/**/*.html'],
		dest: 'static/css/'
	}
};

const sources = paths.styles.src.concat(paths.js.src);

task('styles', () => {
	return src(paths.styles.src)
		.pipe(dest(paths.styles.tmp))
		.pipe(concat('mi.scss'))
		.pipe(sourcemaps.init())
		.pipe(sass()
			.on('error', sass.logError))
		.pipe(hash())
		.pipe(sourcemaps.write('.'))
		.pipe(dest(paths.styles.stat))
		.pipe(hash.manifest('hash.json'))
		.pipe(dest(paths.styles.dest));
});

task('purge', () => {
	return src(paths.purge.src)
		.pipe(purgecss({ content: paths.purge.content }))
		.pipe(dest(paths.purge.dest))
});

task('js', () => {
	return src(paths.js.src)
		.pipe(dest(paths.js.tmp))
		.pipe(sourcemaps.init())
		.pipe(concat('mi.js'))
		.pipe(babel({ presets: ['@babel/env'] }))
		.pipe(hash())
		.pipe(sourcemaps.write('.'))
		.pipe(dest(paths.js.stat))
		.pipe(hash.manifest('hash.json'))
		.pipe(dest(paths.js.dest));
});

task('clean', () => {
  	return del([
		paths.styles.tmp,
		paths.styles.dest,
		paths.styles.stat,
		paths.js.tmp,
		paths.js.dest,
		paths.js.stat
  	]);
});

task('default', series(['clean', 'js', 'styles']));

task('watch', () => {
	watch(sources, (done) => {
		series(['clean', 'js', 'styles', 'purge'])(done);
	});
});