/* jshint node:true */
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var PATHS = {
  STYL: 'styl/main.styl',
  JS: [
    'js/i18n.js',
    'js/MangaElt.js',
    'js/mgEntry.js',
    'js/BSync.js',
    'js/personalstat.js',
    'js/wssql.js',
    'js/amrcsql.js',
    'js/lib.js',
    'js/background.js'
  ],
  JSX: 'src/**',
  DEST: 'build/'
};

function createJsTask (path) {
  return function () {
    return gulp.src(path)
      .pipe(plugins.plumber())
      .pipe(plugins.sourcemaps.init())
      // .pipe(plugins.jshint())
      // .pipe(plugins.jshint.reporter('jshint-stylish'))
      .pipe(plugins.babel())
      // .pipe(plugins.concat('main.js'))
      // .pipe(plugins.wrap(';(function () {\n\'use strict\';\n<%= contents %>\n}).call(this);'))
      .pipe(plugins.sourcemaps.write('.'))
      .pipe(plugins.plumber.stop())
      .pipe(gulp.dest(PATHS.DEST));
  }
}

function createWatchTask (taskName) {
  return function () {
    gulp.watch(PATHS[taskName.toUpperCase()], [taskName]);
  }
}

['jsx', 'js'].forEach(function (taskName) {
  gulp.task(taskName, createJsTask(PATHS[taskName.toUpperCase()]));
  gulp.task(taskName + ':watch', createWatchTask(taskName));
});

gulp.task('styl', function () {
  return gulp.src(PATHS.STYL)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.plumber())
    .pipe(plugins.stylus())
    // .pipe(plugins.csscomb())
    .pipe(plugins.concat('main.css'))
    .pipe(plugins.plumber.stop())
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest(PATHS.DEST));
});

gulp.task('styl:watch', function () {
  return gulp.watch('styl/*.styl', ['styl']);
});

gulp.task('default', function () {
  gulp.start(['styl', 'js', 'jsx']);
});

gulp.task('watch', function () {
  gulp.start(['default']);
  gulp.watch(PATHS.JS, ['js']);
  gulp.watch(PATHS.JSX, ['jsx']);
  gulp.watch(PATHS.STYL, ['styl']);
});
