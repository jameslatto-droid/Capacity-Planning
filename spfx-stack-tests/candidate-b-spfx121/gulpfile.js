'use strict';
const build = require('@microsoft/sp-build-web');
build.addSuppression("Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.");
// Disable lint for stack bake-off — we only test compile + bundle
if (build.lint) { build.lint.enabled = false; }
build.initialize(require('gulp'));