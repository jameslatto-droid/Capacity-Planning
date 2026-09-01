'use strict';

const build = require('@microsoft/sp-build-web');

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);

// Exclude pre-compiled Tailwind CSS from sp-css-loader (PostCSS incompatibility) and use raw-loader instead
build.configureWebpack.mergeConfig({
  additionalConfiguration: (generatedConfiguration) => {
    const appCssPattern = /ported[/\\]styles[/\\]app\.css$/;
    generatedConfiguration.module.rules.forEach((rule) => {
      if (rule.test && rule.test.toString().includes('css')) {
        if (!rule.exclude) { rule.exclude = []; }
        if (Array.isArray(rule.exclude)) { rule.exclude.push(appCssPattern); }
      }
    });
    generatedConfiguration.module.rules.unshift({
      test: appCssPattern,
      use: [{ loader: 'raw-loader' }],
    });
    return generatedConfiguration;
  },
});

build.initialize(require('gulp'));
