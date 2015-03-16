/* jshint node:true */
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var paths = {
  styl: 'css/src/*.styl',
  js: [
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
  jsx: 'js/components/src/*.js'
};

gulp.task('jsx', function () {
  return gulp.src(paths.jsx)
    // .pipe(plugins.sourcemaps.init())
    .pipe(plugins.react({
      harmony: true
    }))
    .pipe(plugins.wrap(';(function () {\n\'use strict\';\n<%= contents %>\n}).call(this);'))
    .pipe(plugins.concat('Components.js'))
    // .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest('js/components/build'));
});

gulp.task('js', function () {
  return gulp.src(paths.js)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.order(paths.js))
    .pipe(plugins.babel())
    .pipe(plugins.concat('main.js'))
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest('js/dist'));
});

gulp.task('stylus', function () {
  return gulp.src(paths.styl)
    .pipe(plugins.stylus())
    // .pipe(plugins.csscomb())
    .pipe(gulp.dest('css/dist'));
});

gulp.task('watch:stylus', function () {
  gulp.watch(paths.styl, ['stylus']);
});

gulp.task('vendor', function () {
  return gulp.src([
      'js/vendor/jquery/dist/jquery.min.js',
      'js/vendor/jquery-ui/jquery-ui.min.js',
      'js/vendor/react/react-with-addons.js'
    ])
    .pipe(plugins.concat('js/vendor.js'))
    .pipe(gulp.dest('.'));
});

gulp.task('default', function () {
  gulp.start(['vendor', 'stylus', 'js', 'jsx']);
});

gulp.task('watch', function () {
  gulp.start(['default']);
  gulp.watch(paths.jsx, ['jsx']);
  gulp.watch(paths.js, ['js']);
});
