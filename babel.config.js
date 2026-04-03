module.exports = function (api) {
  api.cache(true);
  return {
    // babel-preset-expo is the standard Expo Babel preset.
    // jsxImportSource tells JSX/className interop to work with NativeWind.
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
  };
};