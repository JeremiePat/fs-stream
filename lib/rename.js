'use strict';

var fs      = require('fs');
var path    = require('path');
var through = require('through2');

function rename(n) {
  var fn = typeof n === 'function' ? n : function () { return n; };
  var override = arguments.length > 1 ? !!arguments[1] : false;
  var lastfile;

  return through.obj(function (file, enc, cb) {
    var name    = path.parse(String(fn(file.path))).base;
    var dir     = path.parse(file.path).dir;
    var newpath = path.join(dir, name);

    // We are unable to figure a name we skip the renaming
    if (!name) {
      cb(null, file);
      return;
    }

    fs.access(newpath, function rename(err) {
      // If the target doesn't exist or if we are
      // allowed to override it, we do the renaming
      if (err || override) {
        fs.rename(file.path, newpath, function (err) {
          if (err) { cb(err); return; }

          file.path = newpath;

          fs.stat(newpath, function (err, stats) {
            if (err) { cb(err); return; }

            file.stats = stats;

            if (override) {
              lastfile = file;
              cb();
            } else {
              cb(null, file);
            }
          });
        });

        return;
      }

      // If the target file already exist, we skip the renaming;
      cb(null, file);
    });
  }, function flushOverride(cb) {
    // In case of an override we need to be sure all files
    // have been properly rename so we have to wait for the
    // end of the stream.
    if (override) {
      this.push(lastfile);
    }

    cb();
  });
}

module.exports = rename;
