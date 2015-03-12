// Gulpfile.js
'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var config = require('./gulp.config')();
var $ = require('gulp-load-plugins')();

var port = process.env.PORT || config.defaultPort;

// we'd need a slight delay to reload browsers
// connected to browser-sync after restarting nodemon
var BROWSER_SYNC_RELOAD_DELAY = 1000;

gulp.task('nodemon', function(cb) {
    var called = false;
    return $.nodemon({

            // nodemon our expressjs server
            script: 'server.js',
            ext: 'html js vash',
            ignore: ['ignored.js']
        })
        .on('start', function onStart() {
            // ensure start only got called once
            if (!called) {
                cb();
            }
            called = true;
        })
        .on('restart', function onRestart() {
            // reload connected browsers after a slight delay
            setTimeout(function reload() {
                browserSync.reload({
                    stream: false //
                });
            }, BROWSER_SYNC_RELOAD_DELAY);
        });
});

gulp.task('browser-sync', ['nodemon'], function() {

    // for more browser-sync config options: http://www.browsersync.io/docs/options/
    browserSync.init({

        // watch the following files; changes will be injected (css & images) or cause browser to refresh
        //files: ['public/**/*.*'],

        // informs browser-sync to proxy our expressjs app which would run at the following location
        proxy: 'http://localhost:1234',

        // informs browser-sync to use the following port for the proxied app
        // notice that the default port is 3000, which would clash with our expressjs
        port: 4321,

        // open the proxied app in chrome
        browser: ['google chrome']
    });
});

gulp.task('serve', function() {
    serve();
});

gulp.task('default', ['serve']);

//////////////////////////////////

function serve() {
    var nodeOptions = {
        script: config.nodemon.script,
        delayTime: config.nodemon.delayTime,
        env: config.nodemon.env,
        watch: config.nodemon.watch,
        ignore: config.nodemon.ignore
    };

    return $.nodemon(nodeOptions)
        .on('restart', function(ev) {
            console.log('*** nodemon restarted');
            console.log('files changed:\n' + ev);
            setTimeout(function() {
                browserSync.notify('reloading now ...');
                browserSync.reload({
                    stream: false
                });
            }, config.nodemon.restartDelay);
        })
        .on('start', function() {
            console.log('*** nodemon started');
            startBrowserSync();
        })
        .on('crash', function() {
            console.log('*** nodemon crashed: script crashed for some reason');
        })
        .on('exit', function() {
            console.log('*** nodemon exited cleanly');
        });
}

function startBrowserSync() {
    if (browserSync.active) {
        return;
    }

    console.log('Starting BrowserSync on port ' + port);

    var options = {
        proxy: 'localhost:' + port,
        port: config.browserSync.port,
        files: config.browserSync.files,
        ghostMode: config.browserSync.ghostMode,
        injectChanges: config.browserSync.injectChanges,
        logFileChanges: config.browserSync.logFileChanges,
        logLevel: config.browserSync.logLevel,
        logPrefix: config.browserSync.logPrefix,
        notify: config.browserSync.notify,
        reloadDelay: config.browserSync.reloadDelay,
        browser: config.browserSync.browser
    };

    browserSync(options);
}
