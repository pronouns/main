'use strict';

before(function (done) {
  console.log('ouhewfuowhuhwr');
  var mongooseService = require('./config/lib/mongoose');
  mongooseService.connect(function (db) {
    mongooseService.loadModels(function () {
      done();
    });
  });
});

after(function (done) {
  var mongooseService = require('./config/lib/mongoose');
  mongooseService.disconnect(function (cb) {
    done();
  });
});
