'use strict';

Object.defineProperty(exports, "__esModule", {
		value: true
});
exports.all = exports.styles = undefined;
exports.images = images;
exports.js = js;
exports.purge = purge;
exports.renderSassFiles = renderSassFiles;

var _gulp = require('gulp');
var _gulp2 = _interopRequireDefault(_gulp);
var _gulpSass = require('gulp-sass');
var _gulpSass2 = _interopRequireDefault(_gulpSass);
var _gulpPostcss = require('gulp-postcss');
var _gulpPostcss2 = _interopRequireDefault(_gulpPostcss);
var _autoprefixer = require('autoprefixer');
var _autoprefixer2 = _interopRequireDefault(_autoprefixer);
var _gulpHash = require('gulp-hash');
var _gulpHash2 = _interopRequireDefault(_gulpHash);
var _gulpConcat = require('gulp-concat');
var _gulpConcat2 = _interopRequireDefault(_gulpConcat);
var _gulpPurgecss = require('gulp-purgecss');
var _gulpPurgecss2 = _interopRequireDefault(_gulpPurgecss);
var _gulpSourcemaps = require('gulp-sourcemaps');
var _gulpSourcemaps2 = _interopRequireDefault(_gulpSourcemaps);
var _gulpNotify = require('gulp-notify');
var _gulpNotify2 = _interopRequireDefault(_gulpNotify);
var _gulpPlumber = require('gulp-plumber');
var _gulpPlumber2 = _interopRequireDefault(_gulpPlumber);
var _postcssPresetEnv = require('postcss-preset-env');
var _postcssPresetEnv2 = _interopRequireDefault(_postcssPresetEnv);
var _vinylPaths = require('vinyl-paths');
var _vinylPaths2 = _interopRequireDefault(_vinylPaths);
var _del = require('del');
var _del2 = _interopRequireDefault(_del);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var partials = "themes/micgn/layouts/partials/";
var views    = "themes/micgn/layouts/_default/views/";

// import cleanCSS from 'gulp-clean-css';

var docs = "docs/";
var paths = {
		styles: {
				src: ["src/scss/*.scss", partials + "**/*.scss", views + "**/*.scss"],
				tmp: 'src/tmp/',
				stat: 'static/css/',
				dest: 'data/css/'
		},
		js: {
				src: ["src/js/**/*.js", partials + "**/*.js", views  + "**/*.js"],
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

var postCssPlugins = [(0, _autoprefixer2.default)({ browsers: ['last 20 versions'] }), _postcssPresetEnv2.default];

function clean(path) {
		(0, _del2.default)(path);
}

function images() {
		clean(paths.images.stat);
		return _gulp2.default.src(paths.images.src).pipe((0, _gulpHash2.default)()).pipe(_gulp2.default.dest(paths.images.stat)).pipe(_gulpHash2.default.manifest("hash.json")).pipe(_gulp2.default.dest(paths.images.dest));
}

function js() {
		clean(paths.js.stat);
		clean(paths.js.dest);
		return _gulp2.default.src(paths.js.src).pipe((0, _gulpConcat2.default)('main.js')).pipe((0, _gulpHash2.default)()).pipe(_gulp2.default.dest(paths.js.stat)).pipe(_gulpHash2.default.manifest("hash.json")).pipe(_gulp2.default.dest(paths.js.dest));
}

function purge() {
		return _gulp2.default.src(paths.purge.src).pipe((0, _gulpPurgecss2.default)({
				content: paths.purge.content
		})).pipe(_gulp2.default.dest(paths.purge.dest));
}

function renderSassFiles() {
		clean(paths.styles.stat);
		clean(paths.styles.dest);
		return _gulp2.default.src(paths.styles.src).pipe(_gulp2.default.dest(paths.styles.tmp)).pipe((0, _gulpConcat2.default)('mi.scss')).pipe((0, _gulpSass2.default)({ outputStyle: "compressed" })).pipe((0, _gulpHash2.default)()).pipe(_gulpSourcemaps2.default.init()).pipe((0, _gulpPostcss2.default)(postCssPlugins)).pipe(_gulpSourcemaps2.default.write('.')).pipe(_gulp2.default.dest(paths.styles.stat)).pipe(_gulpHash2.default.manifest("hash.json")).pipe(_gulp2.default.dest(paths.styles.dest));
}

function watchFiles() {
		_gulp2.default.watch(paths.js.src, js);
		_gulp2.default.watch(paths.styles.src, renderSassFiles);
}

var styles = exports.styles = _gulp2.default.series(renderSassFiles);
var all = exports.all = _gulp2.default.series(styles, js, purge);
exports.default = watchFiles;
