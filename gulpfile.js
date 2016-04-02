'use strict';
const gulp = require('gulp');
const babel = require('gulp-babel');
const shell = require('gulp-shell')

gulp
  .task('js', shell.task([
    './node_modules/.bin/babel src -d lib'
  ]))
  .task('css', shell.task([
    './node_modules/.bin/stylus -u ./node_modules/nib ./stylus/main.styl -o public/css/'
  ]))
  .task('build', [
    'js'
  ])
  .task('start', ['build'], shell.task([
    'nterm'
  ]))
