var gulp = require('gulp'); //requires the core Gulp library
var g = require('gulp-load-plugins')(); //read the dependencies in the package.json file and inject each of them for us.
var browserSync = require('browser-sync');
var del = require('del');
var runSequence = require('run-sequence');

//jshint block
//Stylish reporter for JSHint(reporter looked more beauty)
//use jshintConfig in package.json to specifying Linting Options
var stylish = require('jshint-stylish');
var packageJSON = require('./package');
//var jshintConfig = packageJSON.jshintConfig;

var paths = {
    dist: {
        all: 'dist/**/*',
        js: 'dist/js',
        css: 'dist/css',
        img: 'dist/img',
        html: 'dist/html',
        lib: 'dist/lib'
    },
    app: {
        all: 'app/**/*',
        less: 'app/style/**/*.less',
        js: 'app/js/**/*.js',
        img: 'app/img/**/*',
        html: 'app/views/**/*.html'
    }
};

// Clean dist
gulp.task('clean', function() {
    return del('dist/*');
});

//minifies js
gulp.task('minifyJS', function() {
    return gulp.src(paths.app.js)
        .pipe(g.uglify())
        .pipe(gulp.dest(paths.dist.js));
});

// Inspect js
gulp.task('jshint', function() {
    gulp.src(paths.app.js)
        .pipe(g.jshint(packageJSON.jshintConfig))
        .pipe(g.jshint.reporter(stylish))
});

//compress less & minify css
gulp.task('less', function() {
    return gulp.src(paths.app.less)
        .pipe(g.less())
        .pipe(g.minifyCss())
        .pipe(gulp.dest(paths.dist.css));
});

//minify HTML
gulp.task('minifyHTML', function() {
    return gulp.src(paths.app.html)
        .pipe(g.htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest(paths.dist.html));
});

// Watching static resources
gulp.task('watch', function() {
    gulp.watch(paths.app.html, ['minifyHTML']);
    gulp.watch(paths.app.less, ['less']);
    gulp.watch(paths.app.js, ['jshint', 'minifyJS']);
});

// Synchronously update browser
gulp.task('browser', function() {
    browserSync({
        //proxy: 'localhost:3000',
        //port: 3001,
        server: './',
        startPath: 'dist/html/index.html'
    });

    gulp.watch([paths.app.all], browserSync.reload);
});

// Only build
gulp.task('build', function() {
    runSequence('clean', ['jshint', 'minifyJS', 'less', 'minifyHTML']);
});

// Build & Watch
gulp.task('build-watch', ['build', 'watch'], function() {
    console.log('App frontend is built and watching on static resources...');
});

gulp.task('default', function() {
    //Run a series of dependent gulp tasks in order
    runSequence('build-watch', 'browser');
});