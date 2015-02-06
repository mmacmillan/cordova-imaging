var fs = require('fs'),
    pth = require('path'),
    Q = require('q'),
    _ = require('lodash'),
    xmlParser = require('xml2js').parseString,
    magickResize = require('imagemagick').resize,
    defaultConfig = require('./config');

//** load the optional app specific imaging config
var config = _.extend({}, defaultConfig);
try { 
    _.extend(config, require(process.cwd() + '/imaging.json'));
}
catch(e) {}

var imaging = {
    project: null,
    failed: false,
    targetPlatforms: [],

    cmd: function() {
        imaging.run();
    },

    run: function() {
        var def = Q.defer(),
            handleError = function(err) { console.log('an unexpected error occurred', err) };

        imaging.verifyEnvironment()
            .then(imaging.verifySources)
            .then(imaging.loadProject)
            .then(imaging.generateIcons)
            .then(function() {
                console.log('imaging complete!');

                if(imaging.failed)
                    console.log('it looks like there was a problem along the way; check your folder structure');

            })
            .catch(handleError);
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
                console.log('   ', platform, '...', exists?'found':'not found');
                if(exists) imaging.targetPlatforms.push(cfg);
                d.resolve();
            });

            return d.promise;
        }

        //** determine which platforms are supported based on whats defined in the config, and what is on disk
        console.log('verifying platforms');
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
                console.log('    appicon source ...', !!config.sources.appicon?'found':'not found');
                !config.sources.appicon
                    ? def.reject('at least one platform is generating icons, and an appicon source hasn\'t been defined')
                    : actions.push(checkSource.bind(this, config.sources.appicon));
            }

            //** same thing for splashscreens
            if(needsSplash) {
                console.log('    splashscreen source ...', !!config.sources.splashscreen?'found':'not found');
                !config.sources.appicon
                    ? def.reject('at least one platform is generating splashscreens, and a splashscreen source hasn\'t been defined')
                    : actions.push(checkSource.bind(this, config.sources.splashscreen));
            }

            Q.all(actions).then(def.resolve, def.reject.bind(def, 'the sources could not be verified'));
        }

        return p;
    },

    loadProject: function() {
        var def = Q.defer();

        console.log('loading project');

        //** load the project's config.xml and extract the project's xml
        fs.readFile(config.configXml, function(err, xml) {
            if(err) return def.reject('the config.xml file could not be located; are you sure this is a Cordova project?');

            xmlParser(xml, function(err, data) {
                if(err) return def.reject('there was a problem reading', config.configXml);

                //** grab a few of the project details
                imaging.project = {
                    id: data.widget['$'].id,
                    version: data.widget['$'].version,
                    name: data.widget.name[0]
                };

                console.log('   ', imaging.project.name, imaging.project.version);
                def.resolve();
            });
        });

        return def.promise;
    },

    generateIcons: function() {
        var def = Q.defer(),
            queue = [];

        //** initiate icon generation for each platform that has it enabled
        _.each(imaging.targetPlatforms, function(cfg) {
            var def = Q.defer();

            if(!cfg.generateIcons) {
                def.resolve();
                return def.promise; 
            }

            console.log('generating icons for', cfg.name);

            var assetPath = cfg.assetPath.replace('$name$', imaging.project.name),
                fn = imaging.generateIcon.bind(this, assetPath);

            queue.push(Q.all(_.map(cfg.icons, fn)));
        });

        return Q.all(queue);
    },

    generateIcon: function(path, icon) {

        //** generate the options for this icon, based on the root config
        var def = Q.defer(),
            opt = _.extend({}, config.imagemagick.resize, {
                srcPath: pth.join(process.cwd(), config.sources.appicon),
                dstPath: pth.join(process.cwd(), path, icon.output),
                height: icon.size,
                width: icon.size
            });

        console.log('   ', icon.size, 'x', icon.size, icon.output);
        magickResize(opt, function(err) {
            //** imagemagick wont create directories (yet), so a failure in creating images usually means directories are missing...
            !!err ? def.reject(err) : def.resolve();
        });

        return def.promise;
    }
}

module.exports = imaging;
