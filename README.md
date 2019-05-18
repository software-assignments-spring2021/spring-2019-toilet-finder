[![Build Status](https://travis-ci.com/nyu-software-engineering/toilet-finder.svg?branch=master)](https://travis-ci.com/nyu-software-engineering/toilet-finder)
# Toilet Finder
This app is built for those who must heed nature's calling. Using a map interface and user submitted data locations, the app 
will help you find a location to suit your every biological need.

In a more detailed explanation; this application can be thought of as a map of all bathroom locations in the world. It works by using Google Maps and a database of user submitted locations of restrooms. Restrooms will have labels for easier filtering so that users can find a nearby restroom that will fulfill their needs. Users will also have the option to submit bathroom locations that they have found in order to increase the size of the database. In fact the bathroom locations will all be user provided. 

## Installation
First make sure you must have npm installed.

Second obtain all files in this repository by cloning, forking, or downloading the .zip file. Options can be found under the "Clone or Download" button.

Once you have all files on your computer ideally in a folder named "toilet-finder" (this folder can be renamed), open your terminal and cd into the src folder. The directory should look something like 

```...\...\toilet-finder\src```

Once you are in the src folder run the command

```npm install```

This should install all project dependencies.

Currently there is no .apk or iOS app file available. This application is still in the build phase and in order to run this app on your phone you will need to install Expo. Instructions for running this app using expo can be found on the React-Native getting started page here 

<https://facebook.github.io/react-native/docs/getting-started>

After installing Expo on your computer and phone make sure you are still in the src folder and run the following command

```npm start``` or ```expo start --tunnel```

This will start the application as well as start expo. Now open the Expo app on your phone and scan the QR code that appears in your terminal. This should link the expo app with the application now running on your computer.

To terminate the app press `ctrl+c` in your terminal.

## Requirements
Project requirements can be found in our [REQUIREMENTS.md](REQUIREMENTS.md) file.

## Contributing
Project rules and contribution guidelines can be found in our [CONTRIBUTING.md](CONTRIBUTING.md) file.

## Authors
* **Nicholas Ruan** - nr1461@nyu.edu
* **Esther Sun** - es4271@nyu.edu
* **Justin Do** - gd997@nyu.edu
* **Yuankai Shan** - ys1623@nyu.edu

## License
This project is licensed under the GNU General Public License - see [LICENSE](LICENSE) for more details.

