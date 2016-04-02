'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var which = require('which');
var globa = require('global');

var Shell = function () {
  function Shell(options) {
    _classCallCheck(this, Shell);

    this.options = options;
  }

  _createClass(Shell, [{
    key: 'resolve',
    value: function resolve(cmd, cb) {
      return which(cmd, cb);
    }
  }]);

  return Shell;
}();

module.exports = Shell;