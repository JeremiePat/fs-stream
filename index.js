'use strict';

// Modules
// ----------------------------------------------------------------------------
var fs      = require('fs');
var through = require('through2');
var gs      = require('glob-stream');

// API
// ----------------------------------------------------------------------------
function streamer(globPatern, options) {
  return gs.create(globPatern, options)
    .pipe(through.obj(function (chunk, enc, cb) {
      fs.stat(chunk.path, function (err, stats) {
        if (err) { cb(err); return; }

        cb(null, {
          cwd   : chunk.cwd,
          path  : chunk.path,
          stats : stats
        });
      });
    }));
}

streamer.copy   = require('./lib/copy');

module.exports = streamer;
