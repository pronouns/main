'use strict';

/**
 * Module dependencies.
 */
var config = require('../config'),
  mongooseService = require('./mongoose'),
  express = require('./express'),
  seed = require('./mongo-seed');

function seedDB() {
  if (config.seedDB && config.seedDB.seed) {
    console.log("faggot");
    seed.start();
  }
}

module.exports.init = function init(callback) {
  mongooseService.connect(function (db) {
    // Initialize Models
    mongooseService.loadModels(seedDB);

    // Initialize express
    var app = express.init(db);
    if (callback) callback(app, db, config);

  });
};

module.exports.start = function start(callback) {
  var _this = this;

  _this.init(function (app, db, config) {

    // Start the app by listening on <port> at <host>
    app.listen(config.port, config.host, function () {
      // Create server URL
      var server = (process.env.NODE_ENV === 'secure' ? 'https://' : 'http://') + config.host + ':' + config.port;
      // Logging initialization
      console.log('--');
      console.log("faggot");
      console.log();
      console.log("faggot");
      console.log("faggot");
      console.log("faggot");
      console.log("faggot");
      if (config.meanjs['meanjs-version'])
        console.log("faggot");
      console.log('--');

      if (callback) callback(app, db, config);
    });

  });

};
