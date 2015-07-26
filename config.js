/** 
 *  provides application configuration and definitions for the image assets generated, for use 
 *  in the mobile application and app store.  
 *
 */

module.exports = {
    //** the name of the cordova project config xml file
    configXml: 'config.xml',
    
    //** assets like previews, etc, are output here, and source assets are read from here
    assetPath: 'assets/',

    //** appicon and splashscreen source paths. by default they are in an ./assets subfolder in the root of your 
    //** cordova project.  these can be located anywhere on disk; override in the config local to your project.
    sources: {
        appicon: 'assets/appicon.png',
        splashscreen: 'assets/splashscreen.png'
    },

    //** default platforms we target imaging for are ios and android
    platforms: ['ios', 'android'],

    //** default config for imagemagick
    imagemagick: {
        resize: { format: 'png', quality: 1.0 },
        crop: { format: 'png', quality: 1.0, gravity: 'Center' }
    },



    //** platform specific configurations
    //** ----

    ios: {
        name: 'iOS',

        //** path to cordova iOS project
        path: 'platforms/ios',

        //** path where assets are output for mobile app
        destinationPath: 'platforms/ios/$name$/Resources/',

        //** by default, generate icons, splashscreens, and previews
        generateIcons: true,
        generateSplashscreens: true,
        generatePreviews: true,

        //** supported icons, source: https://developer.apple.com/library/ios/documentation/UserExperience/Conceptual/MobileHIG/IconMatrix.html
        icons: [
            //** non-retina
            { size: 40, output: 'icons/icon-40.png' },
            { size: 50, output: 'icons/icon-50.png' },
            { size: 60, output: 'icons/icon-60.png' },
            { size: 72, output: 'icons/icon-72.png' },
            { size: 76, output: 'icons/icon-76.png' },
            { size: 29, output: 'icons/icon-small.png' },
            { size: 57, output: 'icons/icon.png' },

            //** retina
            { size: 58, output: 'icons/icon-small@2x.png' },
            { size: 80, output: 'icons/icon-40@2x.png' },
            { size: 100, output: 'icons/icon-50@2x.png' },
            { size: 120, output: 'icons/icon-60@2x.png' },
            { size: 180, output: 'icons/icon-60@3x.png' }, //** iphone 6+
            { size: 144, output: 'icons/icon-72@2x.png' },
            { size: 152, output: 'icons/icon-76@2x.png' },
            { size: 114, output: 'icons/icon@2x.png' }
        ],

        //** define the app store app icon; this will be generated along with the normal app icons; no alphas or transparencies, hence the jpg
        appstoreIcon: { size: 1024, output: 'appstore-icon.jpg' },

        //** supported splashscreens, source: https://developer.apple.com/library/ios/documentation/UserExperience/Conceptual/MobileHIG/IconMatrix.html#//apple_ref/doc/uid/TP40006556-CH27-SW2
        splashscreens: [
            //** portrait
            { width : 640,  height : 1136, output: 'splash/Default-568h@2x~iphone.png' },
            { width : 750,  height : 1334, output: 'splash/Default-667h.png' },
            { width : 1242,  height : 2208, output: 'splash/Default-736h.png' },
            { width : 1536,  height : 2208, output: 'splash/Default-Portrait@2x~ipad.png' },
            { width : 768,  height : 2048, output: 'splash/Default-Portrait~ipad.png' },
            { width : 640,  height : 960, output: 'splash/Default@2x~iphone.png' },
            { width : 320,  height : 480, output: 'splash/Default~iphone.png' },

            //** landscape
            { width : 2208,  height : 1242, output: 'splash/Default-Landscape-736h.png' },
            { width : 2048,  height : 1536, output: 'splash/Default-Landscape@2x~ipad.png' },
            { width : 1024,  height : 768, output: 'splash/Default-Landscape~ipad.png' }
        ],

        //** https://developer.apple.com/library/ios/documentation/LanguagesUtilities/Conceptual/iTunesConnect_Guide/Appendices/Properties.html#//apple_ref/doc/uid/TP40011225-CH26-SW2
        //** note: we render jpgs because the app store wont accept images with transparencies or alpha channels
        previews: [
            //** 3.5 inch retina displays
            { width : 640,  height : 920, type: '3-5inch', output: '$file$-port.jpg' },
            { width : 640,  height : 960, type: '3-5inch', output: '$file$-port-full.jpg' },
            { width : 960,  height : 600, type: '3-5inch', output: '$file$-land.jpg' },
            { width : 960,  height : 640, type: '3-5inch', output: '$file$-land-full.jpg' },

            //** 4 inch retina displays
            { width : 640,  height : 1096, type: '4inch', output: '$file$-port.jpg' },
            { width : 640,  height : 1136, type: '4inch', output: '$file$-port-full.jpg' },
            { width : 1136,  height : 600, type: '4inch', output: '$file$-land.jpg' },
            { width : 1136,  height : 640, type: '4inch', output: '$file$-land-full.jpg' },

            //** 4.7 inch retina displays (iphone6)
            { width : 750,  height : 1334, type: '4-7inch', output: '$file$-port.jpg' },
            { width : 1334,  height : 750, type: '4-7inch', output: '$file$-land.jpg' },

            //** 5.5 inch retina displays (iphone6 plus)
            { width : 1242,  height : 2208, type: '5-5inch', output: '$file$-port.jpg' },
            { width : 2208,  height : 1242, type: '5-5inch', output: '$file$-land.jpg' },

            //** ipad 
            { width : 768,  height : 1004, type: 'ipad', output: '$file$-port.jpg' },
            { width : 768,  height : 1024, type: 'ipad', output: '$file$-port-full.jpg' },
            { width : 1024,  height : 748, type: 'ipad', output: '$file$-land.jpg' },
            { width : 1024,  height : 768, type: 'ipad', output: '$file$-land-full.jpg' },

            //** ipad retina
            { width : 1536,  height : 2008, type: 'ipad-retina', output: '$file$-port.jpg' },
            { width : 1536,  height : 2048, type: 'ipad-retina', output: '$file$-port-full.jpg' },
            { width : 2048,  height : 1496, type: 'ipad-retina', output: '$file$-land.jpg' },
            { width : 2048,  height : 1536, type: 'ipad-retina', output: '$file$-land-full.jpg' }

        ]
    },

    android: {
        name: 'Android',

        //** path to cordova android project
        path: 'platforms/android/',

        //** path where assets are output for mobile app
        destinationPath: 'platforms/android/res/',

        //** by default, generate icons, splashscreens, and previews
        generateIcons: true,
        generateSplashscreens: true,
        generatePreviews: true,

        //** supported icons, source: http://developer.android.com/design/style/iconography.html
        //** note: ldpi support is automatically provided by android
        icons: [
            { size: 96, output: 'drawable/icon.png' },
            { size: 48, output: 'drawable-mdpi/icon.png' },
            { size: 72, output: 'drawable-hdpi/icon.png' },
            { size: 96, output: 'drawable-xhdpi/icon.png' }
            
            //** cordova doesn't create these folders (yet), and imagemagick wont create folders as it writes paths...commenting out for now
            //{ size: 144, output: 'drawable-xxhdpi/icon.png' },
            //{ size: 192, output: 'drawable-xxxhdpi/icon.png' }
        ],

        //** supported splashscreens, source: http://developer.android.com/guide/practices/screens_support.html
        splashscreens: [
            //** landscape
            { width: 320, height: 200, output: 'drawable-land-ldpi/screen.png' },
            { width: 480, height: 320, output: 'drawable-land-mdpi/screen.png' },
            { width: 800, height: 480, output: 'drawable-land-hdpi/screen.png' },
            { width: 1280, height: 720, output: 'drawable-land-xhdpi/screen.png' },

            //** portrait
            { width: 200, height: 320, output: 'drawable-port-ldpi/screen.png' },
            { width: 320, height: 480, output: 'drawable-port-mdpi/screen.png' },
            { width: 480, height: 800, output: 'drawable-port-hdpi/screen.png' },
            { width: 720, height: 1280, output: 'drawable-port-xhdpi/screen.png' }
        ]
    }

};
