'use strict';

var path      = require('path');
var through   = require('through2');
var minimatch = require('minimatch');

function filter(pattern, keep) {
  if (typeof keep !== 'boolean') {
    keep = true;
  }

  return through.obj(function (file, enc, cb) {
    var fn = typeof pattern === 'function' ? pattern : function (filepath) {
      return minimatch(filepath, path.resolve(file.cwd, pattern));
    };

    var valide = fn(file.path);

    if(valide && keep || !valide && !keep) {
      cb(null, file);
      return;
    }

    cb();
  });
}

module.exports = filter;
