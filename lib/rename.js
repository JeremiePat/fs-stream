'use strict';

var fs      = require('fs');
var path    = require('path');
var through = require('through2');

function rename(n) {
  var fn = typeof n === 'function' ? n : function () { return n; };
  var override = arguments.length > 1 ? !!arguments[1] : false;

  return through.obj(function (file, enc, cb) {
    var name    = path.parse(String(fn(file.path))).base;
    var dir     = path.parse(file.path).dir;
    var newpath = path.join(dir, name);

    if (!name) {
      cb(null, file);
      return;
    }

    fs.access(newpath, function (err) {
      // If the target doesn't exist or if we are
      // allowed to override it, we do the renaming
      if (err || override) {
        fs.rename(file.path, newpath, function (err) {
          if (err) { cb(err); return; }

          file.path = newpath;

          fs.stat(newpath, function (err, stats) {
            if (err) { cb(err); return; }

            file.stats = stats;

            cb(null, file);
          });
        });

        return;
      }

      // If the target file already exist, we skip the renaming;
      cb(null, file);
    });
  });
}

module.exports = rename;
