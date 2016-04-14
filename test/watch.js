'use strict';

var fsnode  = require('fs');
var fsx     = require('fs-extra');
var path    = require('path');
var through = require('through2');
var assert  = require('assert');

var fs = require('../index.js');

describe('watch', function () {
  var root   = path.resolve('.');
  var dir    = path.join('test', 'dir');
  var file1  = path.join(root, dir, 'a.txt');
  var file2  = path.join(root, dir, 'b.txt');

  var title = 'Basic test for watcher';

  beforeEach(function () {
    fsx.ensureFileSync(file1);
    fsx.ensureFileSync(file2);
  });

  afterEach(function () {
    fsx.removeSync(path.join(root, dir));
  });

  it(title, function (done) {
    var files = [];

    function fn(file) {
      if (files.indexOf(file) === -1) {
        files.push(file);
      }

      assert.strictEqual(typeof this.close, 'function', 'The context of the function has a "close" function');

      if (files.length === 2) {
        assert(true, 'Two different files has been touched');
        done();
      }
    }

    fs(path.join(dir, '*.*'))
      .pipe(fs.watch(fn))
      .on('error', done)
      .pipe(through.obj(function (file, e, cb) {
        fsnode.writeFile(file.path, file.path, 'utf8');

        cb(null, file);
      }));
  });
});
