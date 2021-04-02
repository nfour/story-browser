// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    './testProject': { url: '/' },
    './src/react': { url: '/' },
  },
  plugins: [
    '@snowpack/plugin-typescript', // Just does type checks
  ],
  packageOptions: {},
  devOptions: {
    port: 9001,
    open: 'none',
  },
  buildOptions: {
    out: './testProject/x',
  },
}
