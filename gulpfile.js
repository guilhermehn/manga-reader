var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var DEST = '../gallery/public';

gulp.task('css', function() {
  return gulp.src('assets/css/main.styl')
    .pipe(plugins.plumber())
    .pipe(plugins.stylus())
    .pipe(plugins.myth())
    .pipe(plugins.autoprefixer({
      browsers: ['last 5 Chrome versions']
    }))
    .pipe(gulp.dest(DEST));
});

gulp.task('css:watch', function() {
  gulp.watch('assets/css/**/*.styl', ['css']);
});

gulp.task('default', ['css']);
