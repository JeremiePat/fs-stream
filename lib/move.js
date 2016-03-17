'use strict';

var fs      = require('fs');
var fsx     = require('fs-extra');
var path    = require('path');
var through = require('through2');

function move(d) {
  var fn = typeof d === 'function' ? d : function () { return d; };
  var override = arguments.length > 1 ? !!arguments[1] : true;

  return through.obj(function (file, enc, cb) {
    var dir  = path.resolve(file.cwd, String(fn(file.path)));
    var name = path.parse(file.path).base;

    if (!dir || dir === file.path) {
      cb(null, file);
      return;
    }

    fs.stat(dir, function (err, stats) {
      // If the target isn't a directory, we take the parent directory;
      if (!err && !stats.isDirectory()) {
        dir = path.parse(dir).dir;
      }

      var newPath = path.join(dir, name);

      fsx.move(file.path, newPath, {clobber: override}, function (err) {
        if (err) {
          if (err.code === 'EEXIST') {
            cb(null, file);
          } else {
            cb(err);
          }
          return;
        }

        file.path = newPath;

        cb(null, file);
      });
    });
  });
}

module.exports = move;
