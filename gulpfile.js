// Include gulp
var gulp = require('gulp');
var mainBowerFiles = require('main-bower-files');
var replace = require('gulp-replace');

gulp.task('scripts', function() {
    return gulp.src('src/scripts/*.js')
      .pipe(gulp.dest('dist/scripts'));
});

gulp.task('css', function() {
    return gulp.src('src/css/*.css')
      .pipe(gulp.dest('dist/css'));
});

gulp.task('html', function() {
    gulp.src('src/index.html')
        .pipe(replace('../bower_components', 'bower_components'))
        .pipe(gulp.dest('dist'));
}); 

gulp.task('bowerdependencies', function() {
    return gulp.src(mainBowerFiles(/* options */), { base: 'bower_components' })
        .pipe(gulp.dest('./dist/bower_components'))
});

gulp.task('default', ['bowerdependencies','html','scripts','css']);