# SatoshiWallet

## A multicurrency mobile wallet for Bitcoin, Bitcoin Cash, Ethereum, Dash, Litecoin, Ripple/XRP and Monero

![Edge Wallet Screenshots](https://cdn-images-1.medium.com/max/1600/1*xMZMuK0_jGNZNzduvggsdw.png)

Edge Wallet is:

* simple
* secure
* private
* decentralized
* multi-currency
* cross-platform
* mobile first
* open source

---

## Requirements

Edge is known to build with this exact tool set. Updated versions of these toolsets may break the build or app. If you have issues, try mirroring these exact versions.

* MacOS High Sierra 10.13.3
* Xcode 10.1
* Android Studio 3.1.3
* CocoaPods 1.5.3
* Android NDK r15c *This is a must have. Version r17 is known to break native code builds*
* NodeJS 10.15.1
* NPM 6.4.1
* Yarn 1.10.1
* Java 1.8.0_152

## Getting Started

### Install nodejs (v 10.15.1 and npm (v 6.4.1)

    https://nodejs.org/en/download/

### Install yarn

    https://yarnpkg.com

### Install React Native CLI

    npm install -g react-native-cli

### Install CocoaPods (MacOS)

    sudo gem install cocoapods

### Checkout develop branch & install node_modules

    cd edge-react-gui
    yarn

### XCode Setup - Use Legacy Build System

    Open edge-react-gui/ios/edge.xcworkspace in Xcode
    File -> Workspace Settings
    Set `Build System` to `Legacy Build System`

### Android NDK Setup

    *IMPORTANT* You must use version r15c to build. r17 and above break NDK build that this app requires. Download
    the r15c NDK version here: https://developer.android.com/ndk/downloads/older_releases

    (MacOS) If the NDK is already installed from Android Studio, it should be in `/Users/[user]/Library/Android/sdk/ndk-bundle`.
    If you are using a version other than r15c, replace your version with version r15c downloaded from above

### Set the following environment vars

    export ANDROID_NDK_HOME=/Users/[username]/Library/Android/sdk/ndk-bundle
    export NDK_HOME=/Users/[username]/Library/Android/sdk/ndk-bundle
    export SDK_HOME=/Users/[username]/Library/Android/sdk
    export JAVA_HOME="/Applications/Android Studio.app/Contents/jre/jdk/Contents/Home"

### Android Recommended Versioning & Configuration

For best results, please consider using the following versions (up-to-date as of 2018-05-11)

- **Java & Jave JDK** version 8u171

### Add API key in env.json

A public API key is built into the edge-core-js which can be used to build and test the Edge app. This key is severely rate limited and should not be used for production. For production use, get an API key by emailing info@edge.app. 

Copy the `env.example.json` to `env.json` and change the `AIRBITZ_API_KEY` to the API key you received from Edge. To use the public API key, leave `AIRBITZ_API_KEY` blank. 

### Run the app in debug mode

#### iOS

* Open `edge-react-gui/ios/edge.xcworkspace` in Xcode
* Choose a target device or simulator and tap the Play button on the top nav bar

#### Android

    cd android
    ./gradlew assembleDebug

* The resulting APK will be in `./app/build/outputs/apk/debug/app-debug.apk`
* Copy the APK to a simulator like Genymotion or a real device via Email or messaging app

### Build release version of app

#### iOS

* Open `edge-react-gui/ios/edge.xcworkspace` in Xcode
* Hold [ option/alt ] and click on the Edge button on the top bar to the right of the Play and Stop icons.
* Change 'Build Configuration' to Release
* Uncheck 'Debug Executable'
* Close window
* Choose a device and hit Play

#### Android

    cd android
    ./gradlew assembleRelease

* The resulting APK will be in `./app/build/outputs/apk/release/app-release.apk`
* Copy the APK to a simulator like Genymotion or a real device via Email or messaging app

---

## Deploying (MacOS Only)

The included `deploy.js` is a script to automate building, signing, and deploying release builds of Edge. It provides
the following:

* Auto set app version number based on `package.json` version
* Auto increment and set the buildnum to the value of YYMMDDNN where NN is an auto-incrementing build number within a day
* Auto sign Android APK with Android keystore files
* Auto sign iOS IPA with provisioning profiles

### To Use

* Set the env var KEYCHAIN_PASSWORD to the keychain password of the current user
* Copy the `deploy-config.sample.json` to `deploy-config.json` and edit the parameters accordingly. You'll need a HockeyApp account to get ids and keys
* Put any Android keystore files into `edge-react-gui/keystores/`
* If using Firebase, put your account's `google-services.json` and `GoogleService-Info.plist` into `edge-react-gui/`
* Install xcpretty `sudo gem install xcpretty`

Run deploy

    ./deploy.js edge ios master
    ./deploy.js edge android master

---

## Debugging

For debugging, we recommend using React Native Debugger

### MacOS

`brew update && brew cask install react-native-debugger`

##### iOS Simulator

    ⌘ + d (command + d)
    Select "Debug JS Remotely"

### Windows / Linux

https://github.com/jhen0409/react-native-debugger/releases

###### GenyMotion Android Emulator

    ⌘ + m (command + m)
    Select "Debug JS Remotely"

## Contributing

Please follow the coding conventions defined in [Edge Conventions](https://github.com/Airbitz/edge-conventions)
