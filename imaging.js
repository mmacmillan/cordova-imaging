var fs = require('fs'),
    Q = require('q'),
    _ = require('lodash'),
    defaultConfig = require('./config');

//** load the optional app specific imaging config
var config = _.extend({}, defaultConfig);
try { 
    _.extend(config, require(process.cwd() + '/imaging.json'));
}
catch(e) {}

var imaging = {
    targetPlatforms: [],

    cmd: function() {
        imaging.run();
    },

    verifyEnvironment: function() {
        var def = Q.defer(),
            sources = config.sources,
            platforms = [];

        //** simple function to check if a platform is supported, async
        var checkPlatform = function(platform) {
            var d = Q.defer(),
                cfg = config[platform];

            if(!cfg) d.resolve();

            cfg && fs.exists(cfg.path, function(exists) {
                console.log('checking platform support;', platform, '...', exists?'found':'not found');
                if(exists) imaging.targetPlatforms.push(cfg);
                d.resolve();
            });

            return d.promise;
        }

        //** determine which platforms are supported based on whats defined in the config, and what is on disk
        return Q.all(_.map(config.platforms||[], checkPlatform));
    },

    verifySources: function() {
        var def = Q.defer(),
            p = def.promise;

        console.log('verifying sources');

        //** make sure we've defined a few platforms
        if(imaging.targetPlatforms.length == 0)
            def.reject('none of the target platforms were found; have you added platforms to Cordova yet?');
        else {
            //** see what we need to generate
            var needsIcon = _.find(imaging.targetPlatforms, function(cfg) { return cfg.generateIcons; }),
                needsSplash = _.find(imaging.targetPlatforms, function(cfg) { return cfg.generateSplashscreens; }),
                actions = [];

            var checkSource = function(path) {
                var d = Q.defer();

                fs.exists(path, function(exists) {
                    !!exists
                        ? d.resolve()
                        : d.reject('could not find the source: ', path);
                });

                return d.promise;
            }

            //** if we need to generate app icons, verify the source has been defined and is valid
            if(needsIcon) {
                console.log('verifying appicon source');
                !config.sources.appicon
                    ? def.reject('at least one platform is generating icons, and an appicon source hasn\'t been defined')
                    : actions.push(checkSource.bind(this, config.sources.appicon));
            }

            //** same thing for splashscreens
            if(needsSplash) {
                console.log('verifying splashscreen source');
                !config.sources.appicon
                    ? def.reject('at least one platform is generating splashscreens, and a splashscreen source hasn\'t been defined')
                    : actions.push(checkSource.bind(this, config.sources.splashscreen));
            }

            Q.all(actions).then(def.resolve, def.reject.bind(def, 'the sources could not be verified'));
        }

        return p;
    },

    run: function() {
        var def = Q.defer();

        imaging.verifyEnvironment()
            .then(imaging.verifySources)
            .then(function() {
                console.log('all done');
            })
            .catch(function(err) {
                console.log(err||'something went wrong!');
            });
    }
}

module.exports = imaging;
