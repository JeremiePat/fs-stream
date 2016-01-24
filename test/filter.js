'use strict';

var fsnode    = require('fs');
var fsx       = require('fs-extra');
var path      = require('path');
var minimatch = require('minimatch');
var through   = require('through2');
var assert    = require('assert');

var fs = require('../index.js');


describe('filter', function () {
  var root  = path.resolve('.');
  var dir   = path.join('test', 'dir');
  var file1 = path.join(root, dir, 'a.txt');
  var file2 = path.join(root, dir, 'b.txt');
  var file3 = path.join(root, dir, 'a.md');
  var file4 = path.join(root, dir, 'b.md');
  var match = path.join(dir, '*.txt');

  before(function () {
    fsx.ensureFileSync(file1);
    fsx.ensureFileSync(file2);
    fsx.ensureFileSync(file3);
    fsx.ensureFileSync(file4);
  });

  after(function () {
    fsx.removeSync(path.join(root, dir));
  });

  var configuration = [
    [match],
    [match, true],
    [match, false],
  ];

  function buildFirstParam(paramType) {
    return function (conf) {
      var pattern  = conf[0];
      var keep     = conf[1];
      var keepType = keep === undefined ? 'Default' : String(keep);

      if (paramType === 'fn') {
        pattern = function (file) {
          assert(typeof file === 'string', 'Path as a function get a filepath as param');
          return minimatch(file, path.resolve(root, conf[0]));
        };
      }

      var title = [
        keepType === 'Default' ? 'keep (Default)' :
        keepType === 'true'    ? 'keep' : 'remove',
        '2 files from the stream with pattern:', paramType
      ].join(' ');

      var files = [];

      function chkExt(ext, files) {
        return files.every(function (f) {
          return f.slice(-1 * ext.length) === ext;
        });
      }

      it(title, function (done) {
        function end() {
          assert.strictEqual(files.length, 2, 'There is 2 file left in the stream.');

          if (keepType === 'false') {
            assert(chkExt('.md',  files), 'The remaining file is the markdown file.');
          } else {
            assert(chkExt('.txt', files), 'The remaining files are the text files.');
          }

          done();
        }

        fs(path.join(root, dir, '*.*'))
          .pipe(fs.filter(pattern, keep))
          .on('end', end)
          .on('error', done)
          .pipe(through.obj(function (file, end, cb) {
            files.push(file.path);

            cb(null, file);
          }));
      });
    };
  }

  configuration.forEach(buildFirstParam('string'));
  configuration.forEach(buildFirstParam('fn'));
});
