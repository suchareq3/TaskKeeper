// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require("nativewind/metro");

const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
config.resolver.extraNodeModules = {
  shared: path.resolve(__dirname, '../shared'),
};
config.watchFolders = [
  path.resolve(__dirname, '../shared'),
]; 
config.resolver.nodeModulesPaths = [
  path.resolve(path.join(__dirname, './node_modules')),
];
config.resolver.sourceExts.push("cjs");

module.exports = withNativeWind(config, { input: "./global.css" });