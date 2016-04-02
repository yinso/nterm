'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _setup = require('./setup');

var _setup2 = _interopRequireDefault(_setup);

var _opener = require('opener');

var _opener2 = _interopRequireDefault(_opener);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function run(options) {
  _config2.default.initialize(function (err, config) {
    if (err) {
      console.error(err);
      process.exit(-1);
    }
    var app = (0, _express2.default)();
    _setup2.default.init(app, optionsoptions);
    app.listen(options.port);
    (0, _opener2.default)('http://localhost:' + options.port);
  });
}

module.exports = {
  run: run
};