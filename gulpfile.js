var gulp = require('gulp'),
  babel = require('gulp-babel'),
  eslint = require('gulp-eslint'),
  less = require('gulp-less'),
  path = require('path');

var paths = {
  js: {
    src: 'js/source/**/*.js',
    build: 'public/js'
  },
  css: {
    src: 'css/**/*.less',
    build: 'public/css'
  }
};

// ----- JS -----
gulp.task('js', ['lint', 'babel'],  function() {
});

// Lint
gulp.task('lint', function() {
  return gulp.src([paths.js.src])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

// ES 2015 -> ES 5
gulp.task('babel', function() {
  return gulp.src([paths.js.src])
    .pipe(babel())
    .pipe(gulp.dest(paths.js.build));
});

// ----- CSS -----
gulp.task('less',  function() {
  return gulp.src([paths.css.src])
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest(paths.css.build));
});

// ----- Auto -----
gulp.task('watch', function() {
  gulp.watch(paths.js.src, ['js']);
  gulp.watch(paths.css.src, ['less']);
});

gulp.task('default', ['watch', 'js'], function() {

});
