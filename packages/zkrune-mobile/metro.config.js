// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add Node.js polyfills for crypto libraries
config.resolver.extraNodeModules = {
  stream: require.resolve('stream-browserify'),
  crypto: require.resolve('crypto-browserify'),
  buffer: require.resolve('buffer'),
  process: require.resolve('process/browser'),
};

module.exports = config;
