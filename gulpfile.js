var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var del = require('del');
var gulpCopy = require('gulp-copy');
var watch = require('gulp-watch');
/**
 * Linting Sass stylesheets with Stylelint
 * http://www.creativenightly.com/2016/02/How-to-lint-your-css-with-stylelint/
 */
var postcss = require('gulp-postcss');
var reporter = require('postcss-reporter');
var syntax_scss = require('postcss-scss');
var stylelint = require('stylelint');

var ngConstant = require('gulp-ng-constant');
var extend = require('gulp-extend');
var args = require('yargs').argv;

var templateCache = require('gulp-angular-templatecache');
var minifyHtml = require('gulp-minify-html');
var jsonminify = require('gulp-jsonminify');

var imagemin = require('gulp-imagemin');

var uglify = require("gulp-uglify");
var ngAnnotate = require('gulp-ng-annotate');

var inject = require('gulp-inject');

var htmlreplace = require('gulp-html-replace');

/**
 * This is intended to be a temporary solution until the release of gulp 4.0 which has support
 * for defining task dependencies in series or in parallel.
 */
var runSequence = require('run-sequence');

//
// === PATHS ===
//

var files = {
    jsbundle: 'app.bundle.min.js',
    appcss: 'app.css',
    ionicappmincss: 'ionic.app.min.css',
    ionicbundle: 'ionic.bundle.min.js'    // change to 'ionic.bundle.js' for debugging moduleErr errors
};

var paths = {
    html: ['./src/*.html'],
    sass: ['./src/**/*.scss'],
    templates: ['./src/app/**/*.html'],
    images: ['./src/app/**/img/*'],
    commonimages: ['./src/img/*'],
    scripts: ['./src/app/*.js', './src/app/**/*.module.js', './src/app/**/*.router.js',
        './src/app/**/*.js'],
    dist: ['./www'],

    lib: [
        './src/lib/ionic/js/ionic.bundle.js',
        './src/lib/ngCordova/dist/ng-cordova.js',

        './src/lib/oi.select/dist/select-tpls.js',
        './src/lib/angular-md5/angular-md5.js',
        './src/lib/angular-sqlite/angular-sqlite.js',

        './src/lib/alloyfinger/transformjs/transform.js',
        './src/lib/alloyfinger/alloy_finger.js',
        './src/lib/alloyfinger/alloy_crop/alloy_crop.js',
        './src/lib/angular-base64-2.0.3/angular-base64.js',

        './src/lib/ion-datetime-picker/release/ion-datetime-picker.min.js',

        './src/lib/ionic-native-transitions/dist/ionic-native-transitions.js',

        './src/lib/angular-translate/angular-translate.js',
        './src/lib/angular-translate-loader-static-files/angular-translate-loader-static-files.js'
    ]
};

//
// === TOP LEVEL TASKS (invoke with "gulp <task-name>") ===
//

// default task for DEV
gulp.task('default', ['inject-libs-to-index-html']);

// build task for Development mode、 Staging mode or Production mode
var developmentTask,
    stagingTask,
    productionTask,
    development_ykTask,
    staging_ykTask,
    production_ykTask;

// development task
developmentTask = ['watch', 'sass', 'set-api-config', 'copy-src-to-dest', 'watch-src-folder', 'copy-locales-file'];

// production task
productionTask = ['sass', 'index', 'templates', 'copy-fonts', 'set-api-config', 'imagemin',
    'common-imagemin', 'scripts', 'minify-third-library-js', 'copy-locales-file', 'copy-plugins'];

// staging task
stagingTask = productionTask;


//营口development task
development_ykTask = ['watch-yk', 'sass-yk', 'set-api-config', 'copy-src-to-dest', 'watch-src-folder', 'copy-locales-file'];

//营口staging task
production_ykTask = ['sass-yk', 'index', 'templates', 'copy-fonts', 'set-api-config', 'imagemin',
    'common-imagemin', 'scripts', 'minify-third-library-js', 'copy-locales-file', 'copy-plugins'];

staging_ykTask = production_ykTask;

gulp.task('build', function (callback) {
    runSequence('clean',
        eval((args.env || "development") + "Task"),
        function () {
            if (!args.env || (args.env == "development") ) {
                gutil.log(gutil.colors.yellow('Watching and auto synchronizing the change from src to www, Ctrl-C to stop watching and quit'));
            }else if(args.env == "development_yk"){
                gutil.log(gutil.colors.blue('YK Watching and auto synchronizing the change from src to www, Ctrl-C to stop watching and quit'));
            }else if( (args.env == "staging_yk") || (args.env == "production_yk")){
                gutil.log(gutil.colors.blue("This is the YK address. It's finished."));
            }
        });
});

//
// === CHILD TASKS ===
//

// sass task
// =================================================================
gulp.task('sass', function (done) {
    gulp.src('./src/css/scss/ionic.app.scss')
        .pipe(sass())
        .on('error', sass.logError)
        .pipe(gulp.dest('./src/css/'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({basename: 'ionic.app.min'}))
        .pipe(gulp.dest('./www/css/'))
        .on('end', done);
});

//营口
gulp.task('sass-yk', function (done) {
    gulp.src('./src/css/scss/ionic.appyk.scss')
        .pipe(sass())
        .on('error', sass.logError)
        .pipe(gulp.dest('./src/css/'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({basename: 'ionic.app.min'}))
        .pipe(gulp.dest('./www/css/'))
        .on('end', done);
});

gulp.task('watch', function () {
    gulp.watch(paths.sass, ['sass']);
});

//营口
gulp.task('watch-yk', function () {
    gulp.watch(paths.sass, ['sass-yk']);
});

//
// === CHILD TASKS ===
//

// clean task
// =================================================================
gulp.task('clean', function (cb) {
    return del([
        paths.dist + '/**/*'
    ], cb);
});

// copy all files under the SRC to the WWW directory
// =================================================================
gulp.task('copy-src-to-dest', function () {
    gulp.src(['./src/**/*', './src/index.html'])
        .pipe(gulp.dest('./www'));
});

// watch SRC folder
// =================================================================
gulp.task('watch-src-folder', function () {
    gulp.src(['./src/*', './src/**/*'], {base: './src'})
        .pipe(watch('./src', {base: './src'}))
        .pipe(gulp.dest('./www'));
});

// automatic injection third library script in the index file
// =================================================================
gulp.task('inject-libs-to-index-html', function () {
    gulp.src('./src/index.html')
        .pipe(inject(gulp.src(paths.lib, {read: false}), {relative: true}))
        .pipe(gulp.dest('./src'));
});

// scss lint
// =================================================================
gulp.task("scss-lint", function () {

    // stylelint config rules
    var stylelintConfig = {
        "extends": "stylelint-config-standard",
        "rules": {
            "indentation": [2, {
                "warn": true,
                "except": ["param"],
                "message": "Please use 2 spaces for indentation. Tabs make The Architect grumpy."
            }],
            "number-leading-zero": null
        }
    };

    var processors = [
        stylelint(stylelintConfig),
        reporter({
            clearMessages: true,
            throwError: true
        })
    ];

    return gulp.src(['./src/css/scss/*.scss'])
        .pipe(postcss(processors), {syntax: syntax_scss});
});

// api config
// =================================================================
var config = function (env) {
    gulp.src(['./src/app/config/config.default.json', 'src/app/config/config.' + env + '.json'])
        .pipe(extend('config.json', true))
        .pipe(ngConstant({
            name: 'community.configs',
            deps: []
        }))
        .pipe(rename(function (path) {
            path.basename = 'config';
            path.extname = '.js';
        }))
        .pipe(gulp.dest('src/app/config'));
};

gulp.task('set-api-config', function () {
    config(args.env || "development")
});

// templatesCache task
// =================================================================
gulp.task('templates', function () {
    gulp.src(paths.templates)
        .pipe(minifyHtml({empty: true}))
        .pipe(templateCache({
            standalone: true,
            root: 'app'
        }))
        .pipe(gulp.dest(paths.dist + '/js'));
});

// imagemin images and output them in dist
// =================================================================
gulp.task('imagemin', function () {
    gulp.src(paths.images)
        .pipe(imagemin())
        .pipe(gulp.dest(paths.dist + '/app'));
});

gulp.task('common-imagemin', function () {
    gulp.src(paths.commonimages)
        .pipe(imagemin())
        .pipe(gulp.dest(paths.dist + '/img'));
});

// minify third library script
// =================================================================
gulp.task('minify-third-library-js', function () {
    gulp.src(paths.lib)
        .pipe(uglify())
        .pipe(concat('app.plugin.min.js'))
        .pipe(gulp.dest(paths.dist + '/js'));
});

// prepare Index.html for dist - ie. using min files
// =================================================================
gulp.task('index', function () {
    gulp.src(paths.html)
        .pipe(htmlreplace({
            'sass': 'css/ionic.app.min.css',
            'css': 'css/app.min.css',
            'js': 'js/app.bundle.min.js',
            'third-library-js': 'js/app.plugin.min.js',
            'templates': 'js/templates.js',
            'shared': 'shared/services/app.services.min.js',
            'ionic': 'lib/ionic/js/' + files.ionicbundle
        }))
        .pipe(gulp.dest(paths.dist + '/.'));
});

gulp.task('install', ['git-check'], function () {
    return bower.commands.install()
        .on('log', function (data) {
            gutil.log('bower', gutil.colors.cyan(data.id), data.message);
        });
});

// scripts task
// =================================================================
gulp.task('scripts', function () {
    gulp.src(paths.scripts)
        .pipe(ngAnnotate({
            remove: true,
            add: true,
            single_quotes: true
        }))
        .pipe(uglify())
        .pipe(concat('app.bundle.min.js'))
        .pipe(gulp.dest(paths.dist + '/js'));
});

// copy fonts task
gulp.task('copy-fonts', function () {
    return gulp.src(['./src/font/*', './src/lib/ionic/fonts/*'])
        .pipe(gulpCopy(paths.dist, {prefix: 1}));
});

// copy locales file task
gulp.task('copy-locales-file', function () {
    return gulp.src(['./src/locales/*.json'])
        .pipe(jsonminify())
        .pipe(gulp.dest(paths.dist + '/locales'));
});

// copy datetime style task
gulp.task('copy-plugins', function() {
    gulp.src(['./src/lib/ion-datetime-picker/release/ion-datetime-picker.min.css'
        ,'./src/lib/oi.select/dist/select.css','./src/lib/jquery/dist/jquery.min.js'
        ,'./src/shared/**/*'])
        .pipe(gulpCopy(paths.dist,{prefix: 1}));
});

//
// === OTHER TASKS (used by Ionic CLI default) ===
//
gulp.task('git-check', function (done) {
    if (!sh.which('git')) {
        console.log(
            '  ' + gutil.colors.red('Git is not installed.'),
            '\n  Git, the version control system, is required to download Ionic.',
            '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
            '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
        );
        process.exit(1);
    }
    done();
});
