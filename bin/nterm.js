#!/usr/bin/env node
'use strict';
var main = require('../lib/main');
var yargs = require('yargs')
  .number('port')
  .default('port', 1337);

main.run(yargs.argv);
