cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "id": "com.telerik.plugins.nativepagetransitions.NativePageTransitions",
        "file": "plugins/com.telerik.plugins.nativepagetransitions/www/NativePageTransitions.js",
        "pluginId": "com.telerik.plugins.nativepagetransitions",
        "clobbers": [
            "window.plugins.nativepagetransitions"
        ]
    },
    {
        "id": "cordova-plugin-file.DirectoryEntry",
        "file": "plugins/cordova-plugin-file/www/DirectoryEntry.js",
        "pluginId": "cordova-plugin-file",
        "clobbers": [
            "window.DirectoryEntry"
        ]
    },
    {
        "id": "cordova-plugin-file.DirectoryReader",
        "file": "plugins/cordova-plugin-file/www/DirectoryReader.js",
        "pluginId": "cordova-plugin-file",
        "clobbers": [
            "window.DirectoryReader"
        ]
    },
    {
        "id": "cordova-plugin-file.Entry",
        "file": "plugins/cordova-plugin-file/www/Entry.js",
        "pluginId": "cordova-plugin-file",
        "clobbers": [
            "window.Entry"
        ]
    },
    {
        "id": "cordova-plugin-file.File",
        "file": "plugins/cordova-plugin-file/www/File.js",
        "pluginId": "cordova-plugin-file",
        "clobbers": [
            "window.File"
        ]
    },
    {
        "id": "cordova-plugin-file.FileEntry",
        "file": "plugins/cordova-plugin-file/www/FileEntry.js",
        "pluginId": "cordova-plugin-file",
        "clobbers": [
            "window.FileEntry"
        ]
    },
    {
        "id": "cordova-plugin-file.FileError",
        "file": "plugins/cordova-plugin-file/www/FileError.js",
        "pluginId": "cordova-plugin-file",
        "clobbers": [
            "window.FileError"
        ]
    },
    {
        "id": "cordova-plugin-file.FileReader",
        "file": "plugins/cordova-plugin-file/www/FileReader.js",
        "pluginId": "cordova-plugin-file",
        "clobbers": [
            "window.FileReader"
        ]
    },
    {
        "id": "cordova-plugin-file.FileSystem",
        "file": "plugins/cordova-plugin-file/www/FileSystem.js",
        "pluginId": "cordova-plugin-file",
        "clobbers": [
            "window.FileSystem"
        ]
    },
    {
        "id": "cordova-plugin-file.FileUploadOptions",
        "file": "plugins/cordova-plugin-file/www/FileUploadOptions.js",
        "pluginId": "cordova-plugin-file",
        "clobbers": [
            "window.FileUploadOptions"
        ]
    },
    {
        "id": "cordova-plugin-file.FileUploadResult",
        "file": "plugins/cordova-plugin-file/www/FileUploadResult.js",
        "pluginId": "cordova-plugin-file",
        "clobbers": [
            "window.FileUploadResult"
        ]
    },
    {
        "id": "cordova-plugin-file.FileWriter",
        "file": "plugins/cordova-plugin-file/www/FileWriter.js",
        "pluginId": "cordova-plugin-file",
        "clobbers": [
            "window.FileWriter"
        ]
    },
    {
        "id": "cordova-plugin-file.Flags",
        "file": "plugins/cordova-plugin-file/www/Flags.js",
        "pluginId": "cordova-plugin-file",
        "clobbers": [
            "window.Flags"
        ]
    },
    {
        "id": "cordova-plugin-file.LocalFileSystem",
        "file": "plugins/cordova-plugin-file/www/LocalFileSystem.js",
        "pluginId": "cordova-plugin-file",
        "clobbers": [
            "window.LocalFileSystem"
        ],
        "merges": [
            "window"
        ]
    },
    {
        "id": "cordova-plugin-file.Metadata",
        "file": "plugins/cordova-plugin-file/www/Metadata.js",
        "pluginId": "cordova-plugin-file",
        "clobbers": [
            "window.Metadata"
        ]
    },
    {
        "id": "cordova-plugin-file.ProgressEvent",
        "file": "plugins/cordova-plugin-file/www/ProgressEvent.js",
        "pluginId": "cordova-plugin-file",
        "clobbers": [
            "window.ProgressEvent"
        ]
    },
    {
        "id": "cordova-plugin-file.fileSystems",
        "file": "plugins/cordova-plugin-file/www/fileSystems.js",
        "pluginId": "cordova-plugin-file"
    },
    {
        "id": "cordova-plugin-file.requestFileSystem",
        "file": "plugins/cordova-plugin-file/www/requestFileSystem.js",
        "pluginId": "cordova-plugin-file",
        "clobbers": [
            "window.requestFileSystem"
        ]
    },
    {
        "id": "cordova-plugin-file.resolveLocalFileSystemURI",
        "file": "plugins/cordova-plugin-file/www/resolveLocalFileSystemURI.js",
        "pluginId": "cordova-plugin-file",
        "merges": [
            "window"
        ]
    },
    {
        "id": "cordova-plugin-file.isChrome",
        "file": "plugins/cordova-plugin-file/www/browser/isChrome.js",
        "pluginId": "cordova-plugin-file",
        "runs": true
    },
    {
        "id": "cordova-plugin-file.androidFileSystem",
        "file": "plugins/cordova-plugin-file/www/android/FileSystem.js",
        "pluginId": "cordova-plugin-file",
        "merges": [
            "FileSystem"
        ]
    },
    {
        "id": "cordova-plugin-file.fileSystems-roots",
        "file": "plugins/cordova-plugin-file/www/fileSystems-roots.js",
        "pluginId": "cordova-plugin-file",
        "runs": true
    },
    {
        "id": "cordova-plugin-file.fileSystemPaths",
        "file": "plugins/cordova-plugin-file/www/fileSystemPaths.js",
        "pluginId": "cordova-plugin-file",
        "merges": [
            "cordova"
        ],
        "runs": true
    },
    {
        "id": "cordova-media-with-compression.MediaError",
        "file": "plugins/cordova-media-with-compression/www/MediaError.js",
        "pluginId": "cordova-media-with-compression",
        "clobbers": [
            "window.MediaError"
        ]
    },
    {
        "id": "cordova-media-with-compression.Media",
        "file": "plugins/cordova-media-with-compression/www/Media.js",
        "pluginId": "cordova-media-with-compression",
        "clobbers": [
            "window.Media"
        ]
    },
    {
        "id": "cordova-plugin-app-version.AppVersionPlugin",
        "file": "plugins/cordova-plugin-app-version/www/AppVersionPlugin.js",
        "pluginId": "cordova-plugin-app-version",
        "clobbers": [
            "cordova.getAppVersion"
        ]
    },
    {
        "id": "cordova-plugin-camera.Camera",
        "file": "plugins/cordova-plugin-camera/www/CameraConstants.js",
        "pluginId": "cordova-plugin-camera",
        "clobbers": [
            "Camera"
        ]
    },
    {
        "id": "cordova-plugin-camera.CameraPopoverOptions",
        "file": "plugins/cordova-plugin-camera/www/CameraPopoverOptions.js",
        "pluginId": "cordova-plugin-camera",
        "clobbers": [
            "CameraPopoverOptions"
        ]
    },
    {
        "id": "cordova-plugin-camera.camera",
        "file": "plugins/cordova-plugin-camera/www/Camera.js",
        "pluginId": "cordova-plugin-camera",
        "clobbers": [
            "navigator.camera"
        ]
    },
    {
        "id": "cordova-plugin-camera.CameraPopoverHandle",
        "file": "plugins/cordova-plugin-camera/www/CameraPopoverHandle.js",
        "pluginId": "cordova-plugin-camera",
        "clobbers": [
            "CameraPopoverHandle"
        ]
    },
    {
        "id": "cordova-plugin-device.device",
        "file": "plugins/cordova-plugin-device/www/device.js",
        "pluginId": "cordova-plugin-device",
        "clobbers": [
            "device"
        ]
    },
    {
        "id": "cordova-plugin-file-opener2.FileOpener2",
        "file": "plugins/cordova-plugin-file-opener2/www/plugins.FileOpener2.js",
        "pluginId": "cordova-plugin-file-opener2",
        "clobbers": [
            "cordova.plugins.fileOpener2"
        ]
    },
    {
        "id": "cordova-plugin-file-transfer.FileTransferError",
        "file": "plugins/cordova-plugin-file-transfer/www/FileTransferError.js",
        "pluginId": "cordova-plugin-file-transfer",
        "clobbers": [
            "window.FileTransferError"
        ]
    },
    {
        "id": "cordova-plugin-file-transfer.FileTransfer",
        "file": "plugins/cordova-plugin-file-transfer/www/FileTransfer.js",
        "pluginId": "cordova-plugin-file-transfer",
        "clobbers": [
            "window.FileTransfer"
        ]
    },
    {
        "id": "cordova-plugin-inappbrowser.inappbrowser",
        "file": "plugins/cordova-plugin-inappbrowser/www/inappbrowser.js",
        "pluginId": "cordova-plugin-inappbrowser",
        "clobbers": [
            "cordova.InAppBrowser.open",
            "window.open"
        ]
    },
    {
        "id": "cordova-plugin-network-information.network",
        "file": "plugins/cordova-plugin-network-information/www/network.js",
        "pluginId": "cordova-plugin-network-information",
        "clobbers": [
            "navigator.connection",
            "navigator.network.connection"
        ]
    },
    {
        "id": "cordova-plugin-network-information.Connection",
        "file": "plugins/cordova-plugin-network-information/www/Connection.js",
        "pluginId": "cordova-plugin-network-information",
        "clobbers": [
            "Connection"
        ]
    },
    {
        "id": "es6-promise-plugin.Promise",
        "file": "plugins/es6-promise-plugin/www/promise.js",
        "pluginId": "es6-promise-plugin",
        "runs": true
    },
    {
        "id": "cordova-plugin-screen-orientation.screenorientation",
        "file": "plugins/cordova-plugin-screen-orientation/www/screenorientation.js",
        "pluginId": "cordova-plugin-screen-orientation",
        "clobbers": [
            "cordova.plugins.screenorientation"
        ]
    },
    {
        "id": "cordova-plugin-splashscreen.SplashScreen",
        "file": "plugins/cordova-plugin-splashscreen/www/splashscreen.js",
        "pluginId": "cordova-plugin-splashscreen",
        "clobbers": [
            "navigator.splashscreen"
        ]
    },
    {
        "id": "cordova-plugin-statusbar.statusbar",
        "file": "plugins/cordova-plugin-statusbar/www/statusbar.js",
        "pluginId": "cordova-plugin-statusbar",
        "clobbers": [
            "window.StatusBar"
        ]
    },
    {
        "id": "cordova-plugin-x-toast.Toast",
        "file": "plugins/cordova-plugin-x-toast/www/Toast.js",
        "pluginId": "cordova-plugin-x-toast",
        "clobbers": [
            "window.plugins.toast"
        ]
    },
    {
        "id": "cordova-plugin-x-toast.tests",
        "file": "plugins/cordova-plugin-x-toast/test/tests.js",
        "pluginId": "cordova-plugin-x-toast"
    },
    {
        "id": "install.Install",
        "file": "plugins/install/www/install.js",
        "pluginId": "install",
        "clobbers": [
            "install"
        ]
    },
    {
        "id": "ionic-plugin-keyboard.keyboard",
        "file": "plugins/ionic-plugin-keyboard/www/android/keyboard.js",
        "pluginId": "ionic-plugin-keyboard",
        "clobbers": [
            "cordova.plugins.Keyboard"
        ],
        "runs": true
    },
    {
        "id": "jpush-phonegap-plugin.JPushPlugin",
        "file": "plugins/jpush-phonegap-plugin/www/JPushPlugin.js",
        "pluginId": "jpush-phonegap-plugin",
        "clobbers": [
            "JPush"
        ]
    },
    {
        "id": "org.cordova.LifeListener.LifeListener",
        "file": "plugins/org.cordova.LifeListener/www/LifeListener.js",
        "pluginId": "org.cordova.LifeListener",
        "clobbers": [
            "LifeListener"
        ]
    },
    {
        "id": "org.cordova.PermissionsPlugin.PermissionsPlugin",
        "file": "plugins/org.cordova.PermissionsPlugin/www/PermissionsPlugin.js",
        "pluginId": "org.cordova.PermissionsPlugin",
        "clobbers": [
            "PermissionsPlugin"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "com.telerik.plugins.nativepagetransitions": "0.6.5",
    "cordova-plugin-compat": "1.2.0",
    "cordova-plugin-file": "4.3.3",
    "cordova-media-with-compression": "2.1.1",
    "cordova-plugin-app-version": "0.1.9",
    "cordova-plugin-camera": "2.3.1",
    "cordova-plugin-console": "1.0.7",
    "cordova-plugin-device": "1.1.6",
    "cordova-plugin-file-opener2": "2.0.19",
    "cordova-plugin-file-transfer": "1.6.3",
    "cordova-plugin-inappbrowser": "1.7.2",
    "cordova-plugin-jcore": "1.1.10",
    "cordova-plugin-network-information": "1.3.1",
    "es6-promise-plugin": "4.1.0",
    "cordova-plugin-screen-orientation": "2.0.1",
    "cordova-plugin-splashscreen": "4.0.3",
    "cordova-plugin-statusbar": "2.2.3",
    "cordova-plugin-whitelist": "1.3.2",
    "cordova-plugin-x-toast": "2.6.0",
    "cordova-plugin-x5-webview": "3.1.0",
    "install": "1.0",
    "ionic-plugin-keyboard": "2.2.1",
    "jpush-phonegap-plugin": "3.2.12",
    "org.cordova.LifeListener": "0.0.1",
    "org.cordova.PermissionsPlugin": "0.0.1",
    "cordova-plugin-disable-ios11-statusbar": "1.0.0"
};
// BOTTOM OF METADATA
});