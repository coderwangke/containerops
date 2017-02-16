'use strict';


var gulp = require('gulp');
var del = require('del');
var uglify = require('gulp-uglify');
// const rename = require('gulp-rename');
var concat = require('gulp-concat');
var source = require('vinyl-source-stream');
var sass = require('gulp-sass');
var imagemin = require('gulp-imagemin');
var gutil = require('gulp-util');
var replace = require('gulp-replace');
var browserSync = require('browser-sync').create();
var minimist = require('minimist');
var fs = require("fs");


var args = minimist(process.argv.slice(2), {
    boolean: ["dist"]
});

gulp.task('dev:clean', function() {
    return del(['./dev']);
});

/**
 *  This will compile scss to css
 */
gulp.task('dev:styles', function() {
    return gulp.src('./src/sass/**/*.{scss,css}', { base: "./src/sass" })
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./dev/src/sass/'))
        .pipe(browserSync.stream())
        .on('error', gutil.log);
});


gulp.task('dev:source-to-dist', function() {
    return gulp.src('src/js/**/*.js', { base: "./src" })
        .pipe(gulp.dest('dev/src'))
        .on('error', gutil.log);
})

/**
 *  This will copy templates to dev dist folder
 */
gulp.task('dev:html', function() {
    return gulp.src('src/**/*.html')
        // .pipe(uglify())
        .pipe(gulp.dest('dev/src'))
        .on('error', gutil.log);
})

/**
 *  This will copy assets to dev dist folder
 */
gulp.task('dev:images', function() {
    return gulp.src('src/assets/{images,svg}/*', { base: './src/assets' })
        .pipe(imagemin())
        .pipe(gulp.dest('dev/src/assets'))
        .on('error', gutil.log);
})

gulp.task('dev:fonts', function() {
    return gulp.src('src/assets/fonts/**', { base: './src/assets/fonts' })
        .pipe(gulp.dest('dev/src/assets/fonts'))
        .on('error', gutil.log);
})

/**
 *  This will copy host json to dev dist folder
 */
gulp.task('dev:json', function() {
    return gulp.src('src/host.json')
        // .pipe(uglify())
        .pipe(gulp.dest('dev/src'))
        .on('error', gutil.log);
})


/**
 *  This will concat all scripts include configed in scripts.json to one file: main.js
 */
gulp.task('dev:3rd-to-dist', ['dev:source-to-dist'], function(done) {
    let config = JSON.parse(fs.readFileSync("src/scripts.json", 'utf8'));
    return gulp.src(config.scripts)
        .pipe(gulp.dest('dev/src/js/libs'))
        .on('error', gutil.log);
});

/**
 *  This will replace imported css in index.html
 */
gulp.task('dev:css-replace', ['dev:styles', 'dev:html'], function() {
    return gulp.src('dev/src/index.html')
        .pipe(replace(/<link rel="stylesheet">/g, '<link rel="stylesheet" href="sass/application.css" >'))
        .pipe(gulp.dest('dev/src'))
        .on('error', gutil.log);
});


gulp.task('dev:reload-js', ['dev:3rd-to-dist'], function(done) {
    browserSync.reload();
    done();
});

gulp.task('dev:reload-html', ['dev:css-replace'], function() {
    browserSync.reload();
});
/**
 *  This will watch files changing and do recompiling
 */
gulp.task("dev:watch", function() {
    gulp.watch("./src/**/*.{scss,css}", ['dev:styles']);
    gulp.watch(["src/js/**/*.js", "src/scripts.json"], ['dev:reload-js']);
    gulp.watch("src/**/*.html", ['dev:reload-html']);
    gulp.watch("src/assets/fonts/*", ['dev:fonts', 'dev:styles']);
    gulp.watch("src/assets/images/*", ['dev:images', 'dev:styles']);
    gulp.watch("src/assets/svg/*", ['dev:images', 'dev:styles']);
});

/**
 *  This will start a server with browser-sync plugin
 */
gulp.task('dev:browser-sync', ['dev:html', 'dev:images', 'dev:fonts', 'dev:css-replace'], function() {
    browserSync.init({
        server: {
            baseDir: "dev/src"
        },
        ghostMode: false
    })
});

gulp.task('dev:copy', ['dev:html', 'dev:images', 'dev:fonts', 'dev:css-replace'], function() {
    if (args.dist) {
        return gulp.src('dev/**')
            .pipe(gulp.dest(args._[0]))
            .on('error', gutil.log);
    }
});

gulp.task('dev', ['dev:clean'], function() {
    if (args.dist) {
        gulp.start('dev:html', 'dev:images', 'dev:fonts', 'dev:json', 'dev:css-replace', 'dev:copy');
    } else {
        // gulp.start('dev:html', 'dev:images', 'dev:fonts', 'dev:json', 'dev:watch', 'dev:css-replace', 'dev:browser-sync');
       gulp.start('dev:html', 'dev:images', 'dev:fonts', 'dev:json','dev:3rd-to-dist', 'dev:watch', 'dev:css-replace','dev:browser-sync');

    }

});