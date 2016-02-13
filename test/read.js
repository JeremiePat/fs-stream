'use strict';

var fsnode  = require('fs');
var fsx     = require('fs-extra');
var path    = require('path');
var through = require('through2');
var assert  = require('assert');

var fs = require('../index.js');

describe('read', function () {
  var root    = path.resolve('.');
  var dir     = path.join('test', 'dir');
  var file    = path.join(dir, 'a.txt');
  var content = 'kikoo !';

  before(function () {
    var f = path.join(root, file);
    fsx.ensureFileSync(f);
    fsnode.writeFileSync(f, content, 'utf8');
  });

  after(function () {
    fsx.removeSync(path.join(root, dir));
  });

  function runTest(conf) {
    var type =        conf === null     ? 'buffer' :
               typeof conf === 'object' ? 'stream' :
                                          'string' ;

    var title = [
      'Read file as ', type,
      type === 'string' && !conf ? ' (default)' : ''
    ].join('');

    it(title, function (done) {
      var cb = {
        string: function cbReadString(str) {
          assert.strictEqual(typeof str, 'string', 'File content is a string');
          assert.strictEqual(str, content, 'File content is the expected string');
          done();
        },

        buffer: function cbReadBuffer(buf) {
          assert.ok(buf instanceof Buffer, 'File content is a Buffer');
          assert.strictEqual(buf.toString(), content, 'File content is the expected string');
          done();
        },

        stream: function cbReadStream(str) {
          assert.ok(str instanceof fsnode.ReadStream, 'File content is an fs.ReadStream');

          var c = '';

          str.on('end', function () {
            assert.strictEqual(c, content, 'File content is the expected string');
            done();
          }).pipe(through(function (buf, e, cb) {
            c += buf.toString();
            cb();
          }));
        }
      };

      fs(file)
        .pipe(fs.read(cb[type], conf))
        .on('error', done);
    });
  }

  [undefined ,'utf8', null, {}].forEach(runTest);
});
