'use strict';

module.exports = {
  tests: {
    client: ['modules/*/tests/client/**/*.js'],
    server: ['mocha.model.loader.js', 'modules/*/tests/server/**/*.js'],
    e2e: ['modules/*/tests/e2e/**/*.js']
  }
};
