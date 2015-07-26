#Cordova-Imaging

>A configuration driven command line imaging utility for Cordova Mobile apps to generate app icons, splash screens, and app store previews for iOS and Android

[Apache Cordova](https://cordova.apache.org/) is an amazing framework for building mobile apps that target many platforms and form factors, but that support comes with the need to provide a version of your app icon and splash screen for each device form factor you choose to support.  Additionally, when you submit your app to the app store, you will need to upload a version of each screen shot for each device form factor.

**Cordova-Imaging** is a Node.js command line utility, driven by an extensible configuration file, that generates these images with [GraphicsMagick](http://www.graphicsmagick.org/), using the [gm](http://aheckmann.github.io/gm/) npm module, based on a single source app icon, splash screen, and preview image(s). 

Currently, only iOS and Android are supported.  


###Installing
    
If you have not already done so, install [GraphicsMagick](http://www.graphicsmagick.org/).  Technically, [ImageMagick](http://www.imagemagick.org/script/index.php) may also be used, as the gm module [supports both](https://github.com/aheckmann/gm#use-imagemagick-instead-of-gm), but I haven't tested it with this library extensively.

If you are on OS X:

    brew install graphicsmagick

Once installed, install the **Cordova-Imaging** module (globally):

    npm install cordova-imaging -g




###Running

To use the default configuration, from within your project's root directory, ensure you have an **./assets** directory containing your app icon and splash screen images. By default, their paths are assumed to be:

   - ./assets/appicon.png
   - ./assets/splashscreen.png

To generate the images, run the following command: 
```shell
cordova-imaging
```

The app icons and splashscreens generated will be automatically added to the mobile projects of the platforms you support; iOS or Android.  This means you will need to have already added that platform to cordova, such as:
```shell
cordova platform add android
```

To view the new app icon and splash screen, just rebuild and relaunch your app using the command line/IDE.  Preview images are output by default to their respective **./assets/previews/\<platform\>/\<form factor\>** directory.



###Custom Configuration

You may provide a custom configuration file, called **./imaging.json**, in your projects root folder, to override default behavior, and provide paths to preview images for generation.  This example config specifies a different path for the splash screen, along with an override for the background color, and provides the path to 3 image previews to generate for each form factor:

```javascript
{
    "sources": {
        "splashscreen": {
            "path": "assets/othersplashscreen.png",        
            "background": "#fff" 
        },
        "previews": [
            "assets/source/preview1.png",
            "assets/source/preview2.png",
            "assets/source/preview3.png"
        ]
    }
}
```

