'use strict';
const build = require('@microsoft/sp-build-web');
build.addSuppression("Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.");
if (build.lint) { build.lint.enabled = false; }
// webpack 4: treat .mjs as auto to allow named CJS imports from framer-motion ESM
build.configureWebpack.mergeConfig({
  additionalConfiguration: function(cfg) {
    cfg.module.rules.push({ test: /\.mjs$/, include: /node_modules/, type: 'javascript/auto' });
    if (!cfg.resolve) cfg.resolve = {};
    if (!cfg.resolve.extensions) cfg.resolve.extensions = ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'];
    else if (cfg.resolve.extensions.indexOf('.mjs') === -1) cfg.resolve.extensions.unshift('.mjs');
    return cfg;
  }
});
build.initialize(require('gulp'));