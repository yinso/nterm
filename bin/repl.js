#!/usr/bin/env node
var yargs = require('yargs');
var repl = require('../lib/repl');

repl.run(yargs.argv);
