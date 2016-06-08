var gulp = require('gulp'),
    babel = require('gulp-babel'),
    rollup = require('gulp-rollup'),
    sass = require('gulp-sass');


gulp.task('default', function() {
    // place code for your default task here
});

gulp.task('build', ['sass'], function() {
   return gulp.src("./app/init.js")
       .pipe(rollup())
       .pipe(babel({ presets: ["es2015"] }))
       .pipe(gulp.dest("build"))
});

gulp.task('sass', function() {
   return gulp.src("./assets/scss/*.scss")
       .pipe(sass())
       .pipe(gulp.dest("./assets/css"))
});