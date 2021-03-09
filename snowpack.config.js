// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    "./TestProject": { url: "/" },
    ".": { url: "/" },
  },
  plugins: [
    "@snowpack/plugin-typescript", // Just does type checks
    // "@snowpack/plugin-babel", // Mainly for @emotion css
  ],
  packageOptions: {
    install: ["@emotion/styled/base"],
  },
  devOptions: {
    open: "none",
  },
  buildOptions: {
    out: "./x",
  },
};
