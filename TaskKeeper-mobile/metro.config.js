// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');


const path = require('path');

// module.exports = {
//   resolver: {
//     // Add extra node modules from outside project folder
//     extraNodeModules: {
//       shared: path.resolve(__dirname, '../shared'), // Adjust path as necessary
//     },
//   },
//   watchFolders: [
//     // Watch the shared folder so Metro can pick up changes
//     path.resolve(__dirname, '../shared'), // Adjust path as necessary
//   ],
// };



/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
config.resolver.extraNodeModules = {
  shared: path.resolve(__dirname, '../shared'),
};
config.watchFolders = [
  path.resolve(__dirname, '../shared'),
];  

module.exports = config;
