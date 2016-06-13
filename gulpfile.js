var gulp = require('gulp'),
    babel = require('gulp-babel'),
    rollup = require('gulp-rollup'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync').create();


gulp.task('default', function() {
    // place code for your default task here
});

gulp.task('build', function() {
   return gulp.src("./app/init.js", {})
       .pipe(rollup())
       .pipe(babel({ presets: ["es2015"] }))
       .pipe(gulp.dest("build"))
});

gulp.task('sass', function() {
   return gulp.src("./assets/scss/*.scss")
       .pipe(sass())
       .pipe(gulp.dest("./assets/css"))
});

gulp.task('watch', function() {
   browserSync.init( {
      server: './'
   });

   gulp.watch("./app/**/*.js", ['build']);
   gulp.watch("./assets/scss/*.scss", ['sass']);
   gulp.watch(["./assets/css/*", "./build/*", "./**/*.html"]).on('change', function () {
      browserSync.reload();
   })
});