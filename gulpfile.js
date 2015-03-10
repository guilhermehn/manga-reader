/* jshint node:true */
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var paths = {
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
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.react())
    .pipe(plugins.concat('Components.js'))
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest('js/components/build'));
});

gulp.task('js', function () {
  return gulp.src(paths.js)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.order(paths.js))
    .pipe(plugins.babel())
    // .pipe(plugins.uglify())
    .pipe(plugins.concat('main.js'))
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest('js/dist'));
});

gulp.task('default', function () {
  gulp.start('jsx');
});

gulp.task('watch', function () {
  gulp.start(['js', 'jsx']);
  gulp.watch(paths.jsx, ['jsx']);
  gulp.watch(paths.js, ['js']);
});
