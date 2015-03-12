module.exports = function() {

    var defaultPort = '1234';

    var config = {

        /**
         * node settings
         */
        defaultPort: defaultPort,

        /**
         * browser sync
         */
        browserSync: {
            port: 3000,
            files: 'public/**/*.*',
            ghostMode: { // these are the defaults t,t,f
                clicks: true,
                forms: true,
                scroll: true
            },
            injectChanges: true,
            logFileChanges: true,
            logLevel: 'debug',
            logPrefix: 'time-tracker',
            notify: true,
            reloadDelay: 0,
            browser: ['google chrome']
        },
        /**
         * Nodemon settings
         */
        nodemon: {
            script: './server.js',
            delayTime: 1,
            env: {
                'PORT': defaultPort
            },
            watch: [
                'views/**/*.*',
                'controllers/**/*.*',
                'server.js'
            ],
            ignore: [
                'public/css/**/*.*'
            ],
            restartDelay: 500
        }
    }
    return config;
};
