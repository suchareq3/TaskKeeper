/* NOTE: I can't find a way to reliably pass env variables from React Native
  without installing expo in the 'shared' project....
  ... so the 'global' & '__DEV__' checks are a workaround for that. */
// set to either 'web', 'mobile', or 'unknown'
export const platform =
  process.env.PLATFORM ||
  (typeof global !== "undefined" && global.__DEV__ ? "mobile" : "unknown");

export const appStartInfo = () => console.log(`accessed shared.js from platform: ${platform}`);