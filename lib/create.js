'use strict';

var fs      = require('fs');
var fsx     = require('fs-extra');
var path    = require('path');
var through = require('through2');

function create(p, options) {
  var fn  = typeof p === 'function' ? p : function () { return p; };
  var opt = options || {};
  opt.type = opt.type || 'file';
  opt.add  = 'add' in opt ? !!opt.add : true;

  return through.obj(function (file, enc, cb) {
    var stream = this;

    if (!file.stats.isDirectory()) {
      cb(null, file);
      return;
    }

    var name = String(fn(file.path));

    if (!name) {
      cb(null, file);
      return;
    }

    var filepath = path.resolve(path.join(file.path, name));

    function done(err) {
      if (err) { cb(err); return; }

      stream.push(file);

      if (opt.add) {
        fs.stat(filepath, function (err, stats) {
          cb(err, {
            cwd   : file.cwd,
            path  : filepath,
            stats : stats
          });
        });

        return;
      }

      cb();
    }

    if (opt.type === 'file') {
      fsx.ensureFile(filepath, done);
      return;
    }

    if (opt.type === 'directory') {
      fsx.ensureDir(filepath, done);
      return;
    }

    cb(null, file);
  });
}

module.exports = create;
