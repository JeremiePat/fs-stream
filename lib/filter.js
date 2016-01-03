'use strict';

var path      = require('path');
var through   = require('through2');
var minimatch = require('minimatch');

function filter(d) {
  var fn   = typeof d === 'function' ? d : function () { return d; };
  var keep = arguments.length > 1 ? arguments[1] : true;

  return through.obj(function (file, enc, cb) {
    var pattern = path.resolve(file.cwd, String(fn(file.path)));
    var valide  = minimatch(file.path, pattern);

    if(valide && keep || !valide && !keep) {
      cb(null, file);
      return;
    }

    cb();
  });
}

module.exports = filter;
