var gulp = require('gulp')
var plugins = require('gulp-load-plugins')()

gulp.task('css', function() {
  return gulp.src('./styl/main.styl')
    .pipe(plugins.plumber())
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.stylus())
    .pipe(plugins.myth())
    .pipe(plugins.autoprefixer({
      browsers: ['last 5 Chrome versions']
    }))
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest('./build/'))
})

gulp.task('css:watch', ['css'], function() {
  gulp.watch('./styl/*.styl', ['css'])
})

gulp.task('watch-build', function() {
  return gulp.src('./build/*')
    .pipe(plugins.livereload())
})

gulp.task('watch', function() {
  plugins.livereload.listen()
  gulp.watch('./build/*', ['watch-build'])
  gulp.start('css:watch')
})

gulp.task('default', ['css'])
