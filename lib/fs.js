'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mkdirpAsync = _bluebird2.default.promisify(_mkdirp2.default);

_fs2.default.mkdirp = _mkdirp2.default;

_fs2.default._writeFile = _fs2.default.writeFile;

_fs2.default.writeFile = function (filePath, data) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? 'utf8' : arguments[2];
  var cb = arguments[3];

  var dirname = _path2.default.dirname(filePath);
  (0, _mkdirp2.default)(dirname, function (err) {
    if (err) return cb(err);
    _fs2.default._writeFile(filePath, data, options, cb);
  });
};

_fs2.default._appendFile = _fs2.default.appendFile;

_fs2.default.appendFile = function (filePath, data) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? 'utf8' : arguments[2];
  var cb = arguments[3];

  var dirname = _path2.default.dirname(filePath);
  (0, _mkdirp2.default)(dirname, function (err) {
    if (err) return cb(err);
    _fs2.default._appendFile(filePath, data, options, cb);
  });
};

_bluebird2.default.promisifyAll(_fs2.default);

module.exports = _fs2.default;