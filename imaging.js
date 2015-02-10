var fs = require('fs'),
    pth = require('path'),
    Q = require('q'),
    _ = require('lodash'),
    xmlParser = require('xml2js').parseString,
    magick = require('imagemagick'),
    gm = require('gm'),
    mkdirp = require('mkdirp'),
    phantomjs = require('phantomjs'),
    defaultConfig = require('./config');

//** load the optional app specific imaging config
var config = _.extend({}, defaultConfig);
try { 
    var cfg = require(process.cwd() + '/imaging.json');
    _.merge(config, cfg);
}
catch(e) {}

var handleError = function(err) { console.log('\nan unexpected error occurred:', err, '\n') };

var imaging = {
    project: null,
    targetPlatforms: [],

    //** runs and generates all-the-things, based on the configuration
    run: function() {
        var def = Q.defer();

        imaging.verifyEnvironment()
            .then(imaging.verifySources)
            .then(imaging.loadProject)
            .then(imaging.generateIcons)
            .then(imaging.generateSplashscreens)
            .then(imaging.generatePreviews)
            .then(function() {
                console.log('imaging complete!');
            })
            .catch(handleError);
    },

    //** this is used by the binary for the cli
    cmd: function() {
        imaging.run();
    },

    util: {
        checkPlatform: function(platform) {
            var def = Q.defer(),
                cfg = config[platform];

            if(!cfg) def.resolve();

            cfg && fs.exists(cfg.path, function(exists) {
                console.log('   ', platform, '...', exists?'found':'not found');
                if(exists) imaging.targetPlatforms.push(cfg);
                def.resolve();
            });

            return def.promise;
        },

        checkPath: function(path) {
            var def = Q.defer(),
                //** allows for the path to be an object { path: '' } or string
                path = typeof(path) === 'string' ? path : path.path; 

            fs.exists(path, function(exists) {
                !!exists
                    ? def.resolve()
                    : def.reject('could not find the path: ', path);
            });

            return def.promise;
        },

        ensurePath: function(path) {
            var def = Q.defer();

            //** checks a path if its exists, creating it if it doesn't (at any depth ala mkdirp)
            imaging.util.checkPath(path).then(def.resolve, mkdirp.bind(this, path, function(err) {
                !!err && def.reject() || def.resolve();
            }));

            return def.promise;
        },

        ensurePathSync: function(path) {
            if(!fs.existsSync(path)) mkdirp.sync(path)
        }
    },

    verifyEnvironment: function() {
        var def = Q.defer(),
            sources = config.sources,
            platforms = [];
        
        //** determine which platforms are supported based on whats defined in the config, and what is on disk
        console.log('verifying platforms');
        return Q.all(_.map(config.platforms||[], imaging.util.checkPlatform));
    },

    verifySources: function() {
        var def = Q.defer(),
            p = def.promise,
            util = imaging.util;

        console.log('\nverifying sources');

        //** make sure we've defined a few platforms
        if(imaging.targetPlatforms.length == 0)
            def.reject('none of the target platforms were found; have you added platforms to Cordova yet?');
        else {
            //** see what we need to generate
            var needsIcon = _.find(imaging.targetPlatforms, function(cfg) { return cfg.generateIcons; }),
                needsSplash = _.find(imaging.targetPlatforms, function(cfg) { return cfg.generateSplashscreens; }),
                actions = [];

            //** verify the asset path exists
            util.ensurePath(config.assetPath);

            //** if we need to generate app icons, verify the source has been defined and is valid
            if(needsIcon) {
                console.log('    appicon source ...', !!config.sources.appicon?'found':'not found');
                !config.sources.appicon
                    ? def.reject('at least one platform is generating icons, and an appicon source hasn\'t been defined')
                    : actions.push(util.checkPath(config.sources.appicon));
            }

            //** same thing for splashscreens
            if(needsSplash) {
                console.log('    splashscreen source ...', !!config.sources.splashscreen?'found':'not found');
                !config.sources.splashscreen
                    ? def.reject('at least one platform is generating splashscreens, and a splashscreen source hasn\'t been defined')
                    : actions.push(util.checkPath(config.sources.splashscreen));
            }

            Q.all(actions).then(def.resolve, def.reject.bind(def, 'the sources could not be verified; check the paths to your sources.'));
        }

        return p;
    },

    loadProject: function() {
        var def = Q.defer();

        console.log('\nloading project');

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



    //** appicon generation methods
    //** ----

    generateIcons: function() {
        var queue = [];

        //** initiate icon generation for each platform that has it enabled
        _.each(imaging.targetPlatforms, function(cfg) {
            if(!cfg.generateIcons || !cfg.icons)
                return Q.resolve();

            console.log('\ngenerating icons for', cfg.name);

            var dest = cfg.destinationPath.replace('$name$', imaging.project.name),
                fn = imaging.generateIcon.bind(this, dest),
                actions = _.map(cfg.icons, fn);

            //** add one more task to generate the app store app icon at the asset path
            !!cfg.appstoreIcon && actions.push(imaging.generateIcon(config.assetPath, cfg.appstoreIcon));

            queue.push(Q.all(actions));
        });

        return Q.all(queue);
    },

    generateIcon: function(path, icon) {

        //** generate the options for this icon, based on the root config
        var def = Q.defer(),
            iconPath = config.sources.appicon,
            opt = _.extend({}, config.imagemagick.resize, {
                srcPath: iconPath[0]=='/' ? iconPath : pth.join(process.cwd(), iconPath),
                dstPath: pth.join(process.cwd(), path, icon.output),
                height: icon.size,
                width: icon.size
            });

        console.log('   ', icon.size, 'x', icon.size, icon.output);
        magick.resize(opt, function(err) {
            //** imagemagick wont create directories (yet), so a failure in creating images usually means directories are missing...
            !!err ? def.reject(err) : def.resolve();
        });

        return def.promise;
    },



    //** splashscreen generation methods
    //** ----

    generateSplashscreens: function() {
        var queue = [];

        //** initiate splashscreen generation for each platform that has it enabled
        _.each(imaging.targetPlatforms, function(cfg) {
            if(!cfg.generateSplashscreens || !cfg.splashscreens)
                return Q.resolve();

            console.log('\ngenerating splashscreens for', cfg.name);

            var dest = cfg.destinationPath.replace('$name$', imaging.project.name),
                fn = imaging.generateSplashscreen.bind(this, dest);

            queue.push(Q.all(_.map(cfg.splashscreens, fn)));
        });

        return Q.all(queue);
    },


    generateSplashscreen: function(path, splash) {
        //** generate the options for this splashscreen, based on the root config
        var def = Q.defer(),
            splashCfg = config.sources.splashscreen;

        if(typeof(splashCfg) === 'string')
            splashCfg = { path: splashCfg };

        var srcPath = splashCfg.path[0]=='/' ? splashCfg.path : pth.join(process.cwd(), splashCfg.path),
            dstPath = pth.join(process.cwd(), path, splash.output);

        console.log('   ', splash.width, 'x', splash.height, splash.output);

        gm(srcPath)
            .gravity('Center')
            .resize(splash.width) //** resize/scale the image to the desired output width
            .extent(splash.width, splash.height) //** sets the destination image size; overflow will be cropped
            .background(splashCfg.background || 'black')
            .quality(100)
            .noProfile() //** no exif, smaller image
            .write(dstPath, function(err) {
                !err && def.resolve() || def.reject();
            });

        return def.promise;
    },


    //** preview generation methods
    //** ----

    generatePreviews: function() {
        var queue = [],
            sources = config.sources.previews;

        if(!sources || !Array.isArray(sources))
            return Q.resolve();

        //** initiate preview generation for each platform that has it enabled
        _.each(imaging.targetPlatforms, function(cfg) {
            if(!cfg.generatePreviews || !cfg.previews)
                return Q.resolve();

            console.log('\ngenerating previews for', cfg.name);
            var path = pth.join(config.assetPath, 'previews', cfg.name),
                fn = imaging.generatePreview.bind(this, path, cfg);

            queue.push(Q.all(_.map(sources, fn)));
        });

        return Q.all(queue);
    },


    generatePreview: function(path, cfg, source) {
        console.log('   ', source);

        //** generate the options for this splashscreen, based on the root config
        var queue = [],
            srcPath = source[0]=='/' ? source : pth.join(process.cwd(), source);

        _.each(cfg.previews, function(preview) {

/*
 * GraphicsMagick implementation
 *  - gm provides a bit easier interface to guarentee the destination image size, so i prefer it over imagemagick
 */

            //** determine the path to the previews of the specific type/platform
            var previewRoot = pth.join(process.cwd(), path, preview.type),
                filename = preview.output.replace('$file$', pth.basename(source, pth.extname(source))),
                previewPath = pth.join(previewRoot, filename),
                opt = _.extend({}, config.imagemagick.crop, {
                    srcPath: srcPath,
                    dstPath: previewPath
                });

            var def = Q.defer();
            queue.push(def.promise);

            //** ensure the destination path, then generate the preview images based on the configuration
            imaging.util.ensurePath(previewRoot).then(function() {
                console.log('       ', preview.width, 'x', preview.height, preview.type, filename);

                gm(srcPath)
                    .resize(preview.width) //** resize/scale the image to the desired output width
                    .extent(preview.width, preview.height) //** sets the destination image size; overflow will be cropped
                    .quality(100)
                    .noProfile() //** no exif, smaller image
                    .write(previewPath, function(err) {
                        !err && def.resolve() || def.reject();
                    });
            }, handleError);


/*
 * ImageMagick implementation
 *
            //** determine the path to the previews of the specific type/platform
            var previewRoot = pth.join(process.cwd(), path, preview.type),
                filename = preview.output.replace('$file$', pth.basename(source, pth.extname(source))),
                previewPath = pth.join(previewRoot, filename),
                opt = _.extend({}, config.imagemagick.crop, {
                    srcPath: srcPath,
                    dstPath: previewPath
                });

            console.log('       ', preview.width, 'x', preview.height, preview.type, filename);
            imaging.util.ensurePathSync(previewRoot);

            //** if we provide both height and width, we get a square and its fubars the crop; give it the largest dimension only.  this will
            //** scale the image, however, which will effect the final dimensions of the image.
            preview.width > preview.height 
                ? (opt.width = preview.width)
                : (opt.height = preview.height);

            //** specify the gravity and crop dimensions for our target preview
            opt.customArgs = [
                '-gravity',
                'Center',
                '-crop',
                preview.width +'x'+ preview.height +'+0+0',
                '+repage'
            ];

            var def = Q.defer();
            queue.push(def.promise);
            magick.resize(opt, function(err) {
                !!err ? def.reject(err) : def.resolve();
            });
*/
        });

        return Q.all(queue);
    }


}

module.exports = imaging;
