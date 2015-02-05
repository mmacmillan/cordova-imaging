/** 
 *  provides application configuration and definitions for the image assets generated, for use 
 *  in the mobile application and app store.  
 *
 */

module.exports = {
    configXml: 'config.xml',

    //** default image source config; use an assets subfolder, as this is also where the appstore images will be generated
    sources: {
        appicon: 'assets/appicon.png',
        splashscreen: 'assets/splashscreen.png'
    },

    //** default platforms are ios and android 
    platforms: ['ios', 'android'],


    //** platform configs

    ios: {
        path: 'platforms/ios',
        assetPath: 'platforms/ios/$name$/Resources/',

        generateIcons: true,
        generateSplashscreens: true,

        //** source: https://developer.apple.com/library/ios/documentation/UserExperience/Conceptual/MobileHIG/IconMatrix.html
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

        //** source: https://developer.apple.com/library/ios/documentation/UserExperience/Conceptual/MobileHIG/IconMatrix.html#//apple_ref/doc/uid/TP40006556-CH27-SW2
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
        ]
    },

    android: {
        path: 'platforms/android/',
        assetPath: 'platforms/android/res/',

        generateIcons: true,
        generateSplashscreens: true,

        //** source: http://developer.android.com/design/style/iconography.html
        //** note: ldpi support is automatically provided by android
        icons: [
            { size: 96, output: 'drawable/icon.png' },
            { size: 48, output: 'drawable-mdpi/icon.png' },
            { size: 72, output: 'drawable-hdpi/icon.png' },
            { size: 96, output: 'drawable-xhdpi/icon.png' },
            { size: 144, output: 'drawable-xxhdpi/icon.png' },
            { size: 192, output: 'drawable-xxxhdpi/icon.png' }
        ],

        //** source: http://developer.android.com/guide/practices/screens_support.html
        splashscreens: [
            //** landscape
            { width: 320, height: 200, output: 'drawable-land-ldpi' },
            { width: 480, height: 320, output: 'drawable-land-mdpi' },
            { width: 800, height: 480, output: 'drawable-land-hdpi' },
            { width: 1280, height: 720, output: 'drawable-land-xhdpi' },

            //** portrait
            { width: 200, height: 320, output: 'drawable-land-ldpi' },
            { width: 320, height: 480, output: 'drawable-land-mdpi' },
            { width: 480, height: 800, output: 'drawable-land-hdpi' },
            { width: 720, height: 1280, output: 'drawable-land-xhdpi' }
        ]
    }

};
