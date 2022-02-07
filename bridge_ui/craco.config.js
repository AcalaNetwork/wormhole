const { addBeforeLoader, loaderByName } = require("@craco/craco");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      const wasmExtensionRegExp = /\.wasm$/;
      webpackConfig.resolve.extensions.push(".wasm");

      webpackConfig.module.rules.forEach((rule) => {
        (rule.oneOf || []).forEach((oneOf) => {
          if (oneOf.loader && oneOf.loader.indexOf("file-loader") >= 0) {
            oneOf.exclude.push(wasmExtensionRegExp);
          }
        });
      });

      const wasmLoader = {
        test: /\.wasm$/,
        include: /node_modules\/(bridge|token-bridge)/,
        loaders: ["wasm-loader"],
      };

      addBeforeLoader(webpackConfig, loaderByName("file-loader"), wasmLoader);

      webpackConfig.module.rules.push(
        {
          // this is needed to be compatible with some @polkadot packages
          test: /\.js$/,
          loader: require.resolve('@open-wc/webpack-import-meta-loader'),
        },
      );

      return webpackConfig;
    },
  },
  babel: {
    // this is needed for some @acala packages
    plugins: [
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-nullish-coalescing-operator',
    ],
  }
};
