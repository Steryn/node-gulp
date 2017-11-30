var gulp = require('gulp'); //requires the core Gulp library
var g = require('gulp-load-plugins')(); //read the dependencies in the package.json file and inject each of them for us.
var runSequence = require('run-sequence');
var sass = require('gulp-ruby-sass');
var del = require('del');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;

//jshint block
//Stylish reporter for JSHint(reporter looked more beauty)
//use jshintConfig in package.json to specifying Linting Options
var stylish = require('jshint-stylish');
var packageJSON = require('./package');
//var jshintConfig = packageJSON.jshintConfig;

var paths = {
    dist: {
        all: 'dist/**/*',
        html: 'dist/html',
        img: 'dist/img',
        js: 'dist/js',
        css: 'dist/css',
        lib: 'dist/lib'
    },
    app: {
        all: 'app/**/*',
        html: 'app/**/*.html',
        img: 'app/img/**/*',
        js: 'app/js/*.js',
        jslib: 'app/js/lib/**/*.js',
        css: 'app/style/lib/**/*.scss',
        less: 'app/style/**/*.less',
        sass: 'app/style/**/*.scss',
    }
};

// Clean dist
gulp.task('clean', function () {
    return del('dist/*');
});
//打包合并js
// gulp.task('scripts', function () {
//     gulp.src(['./src/js/*.js'])
//         .pipe(concat('all.js'))
//         .pipe(srtipDebug())
//         .pipe(uglify())
//         .pipe(gulp.dest('./build/js'));
// })

// Inspect js
gulp.task('jshint', function () {
    gulp.src(paths.app.js)
        .pipe(g.jshint(packageJSON.jshintConfig))
        .pipe(g.jshint.reporter(stylish))
});

//minifies js
gulp.task('minifyJS', function () {
    return gulp.src(paths.app.js)
        .pipe(g.uglify())
        .pipe(gulp.dest(paths.dist.js));
});
//打包lib下js
gulp.task('jslib', function () {
    return gulp.src(paths.app.jslib)
        .pipe(g.uglify())
        .pipe(gulp.dest(paths.dist.js));
});

//打包lib下css
gulp.task('css', function () {
    return gulp.src(paths.app.css)
        .pipe(gulp.dest(paths.dist.css));
});

//compress less & minify css
gulp.task('less', function () {
    return gulp.src(paths.app.less)
        .pipe(g.less())
        .pipe(g.minifyCss())
        .pipe(gulp.dest(paths.dist.css));
});

// style有以下4种选择：nested：嵌套缩进，它是默认值expanded：每个属性占一行,compact：每条样式占一行,compressed：整个压缩成一行
gulp.task('sass', function () {
    sass(paths.app.sass, {
            style: 'compact'
        })
        .on('error', sass.logError)
        .pipe(gulp.dest(paths.dist.css))
        .pipe(reload({
            stream: true
        }))
});


//minify HTML
gulp.task('minifyHTML', function () {
    return gulp.src(paths.app.html)
        .pipe(g.htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest(paths.dist.html));
});

// Only build
gulp.task('build', function () {
    runSequence('clean', ['jshint', 'minifyJS', 'jslib', 'sass', 'less', 'css', 'minifyHTML']);
});

// Watching static resources
gulp.task('watch', function () {
    gulp.watch(paths.app.html, ['minifyHTML']);
    gulp.watch(paths.app.js, ['jshint', 'minifyJS', 'jslib']);
    gulp.watch(paths.app.less, ['css']);
    gulp.watch(paths.app.less, ['less']);
    gulp.watch(paths.app.sass, ['sass']);
});

// Synchronously update browser
gulp.task('browser', function () {
    browserSync.init({
        //proxy: 'localhost:3000',
        //port: 3001,
        server: './',
        startPath: 'dist/html/index.html',
    });

    gulp.watch([paths.app.all], browserSync.reload);
});
//设置代理
// gulp.task('browser-sync', function() {
//     browserSync.init({
//         proxy: "你的域名或IP"
//     });
// });

// Build & Watch
gulp.task('build-watch', ['build', 'watch'], function () {
    // console.log('App frontend is built and watching on static resources...');
});

gulp.task('default', function () {
    //Run a series of dependent gulp tasks in order
    runSequence('build-watch', 'browser');
});