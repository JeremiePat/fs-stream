'use strict';

var fsx       = require('fs-extra');
var path      = require('path');
var through   = require('through2');
var minimatch = require('minimatch');

function remove(pattern) {
  return through.obj(function (file, enc, cb) {
    var fn = typeof pattern === 'function' ? pattern : function (filepath) {
      return minimatch(filepath, path.resolve(file.cwd, pattern));
    };

    if (fn(file.path)) {
      fsx.remove(file.path, cb);
      return;
    }

    cb(null, file);
  });
}

module.exports = remove;
