'use strict';

var fsnode  = require('fs');
var fsx     = require('fs-extra');
var path    = require('path');
var through = require('through2');
var assert  = require('assert');

var fs = require('../index.js');


describe('move', function () {
  var root   = path.resolve('.');
  var dir    = path.join('test', 'dir');
  var origin = path.join(dir, 'origin');
  var target = path.join(dir, 'target');
  var nodir  = path.join(dir, 'nodir');
  var file1o = path.join(origin, 'a.txt');
  var file1t = path.join(target, 'a.txt');
  var file1n = path.join(nodir,  'a.txt');
  var file2o = path.join(origin, 'b.txt');
  var file2t = path.join(target, 'b.txt');
  var file2n = path.join(nodir,  'b.txt');
  var absF1o = path.join(root, file1o);
  var absF1t = path.join(root, file1t);
  var absF1n = path.join(root, file1n);
  var absF2o = path.join(root, file2o);
  var absF2t = path.join(root, file2t);
  var absF2n = path.join(root, file2n);

  beforeEach(function () {
    fsx.ensureFileSync(absF1o);
    fsx.ensureFileSync(absF2o);
    fsx.ensureFileSync(absF2t);

    fsnode.writeFile(absF2o, file2o, 'utf8');
    fsnode.writeFile(absF2t, file2t, 'utf8');
  });

  afterEach(function () {
    fsx.removeSync(path.join(root, dir));
  });

  function fileExist(file) {
    var exist = true;

    try { fsnode.accessSync(file); }
    catch (err) { exist = false; }

    return exist;
  }

  function chkTargetTrue(files) {
    assert(!fileExist(absF1o), file1o + ' no longer exists');
    assert( fileExist(absF1t), file1t + ' has been created');
    assert(!fileExist(absF2o), file2o + ' no longer exists');
    assert( fileExist(absF2t), file2t + ' always exists');
    assert(files.indexOf(absF1o) === -1, file1o + ' is no longer in the stream');
    assert(files.indexOf(absF1t) > -1,   file1t + ' is now part of the stream');
    assert(files.indexOf(absF2o) === -1, file2o + ' is no longer in the stream');
    assert(files.indexOf(absF2t) > -1,   file2t + ' is not part of the stream');
    assert.strictEqual(fsnode.readFileSync(absF2t, 'utf8'), file2o, file2t + ' content has changed');
  }

  function chkTargetFalse(files) {
    assert(!fileExist(absF1o), file1o + ' no longer exists');
    assert( fileExist(absF1t), file1t + ' has been created');
    assert( fileExist(absF2o), file2o + ' still exists');
    assert( fileExist(absF2t), file2t + ' always exists');
    assert(files.indexOf(absF1o) === -1, file1o + ' is no longer in the stream');
    assert(files.indexOf(absF1t) > -1,   file1t + ' is now part of the stream');
    assert(files.indexOf(absF2o) > -1,   file2o + ' is still part of the stream');
    assert(files.indexOf(absF2t) === -1, file2t + ' is not part of the stream');
    assert.strictEqual(fsnode.readFileSync(absF2t, 'utf8'), file2t, file2t + ' content has not changed');
  }

  function chkTargetNoDir(files) {
    assert(!fileExist(absF1o), file1o + ' no longer exists');
    assert( fileExist(absF1n), file1n + ' has been created');
    assert(!fileExist(absF2o), file2o + ' no longer exists');
    assert( fileExist(absF2n), file2n + ' has been created');
    assert(files.indexOf(absF1o) === -1, file1o + ' is no longer in the stream');
    assert(files.indexOf(absF1n) > -1,   file1n + ' is now part of the stream');
    assert(files.indexOf(absF2o) === -1, file2o + ' is no longer in the stream');
    assert(files.indexOf(absF2n) > -1,   file2n + ' is now part of the stream');
  }

  var configuration = [
    {param: [target       ], result: chkTargetTrue },
    {param: [target,  true], result: chkTargetTrue },
    {param: [target, false], result: chkTargetFalse},
    {param: [nodir        ], result: chkTargetNoDir},
    {param: [nodir,   true], result: chkTargetNoDir},
    {param: [nodir,  false], result: chkTargetNoDir},
    {param: [file2t       ], result: chkTargetTrue },
    {param: [file2t,  true], result: chkTargetTrue },
    {param: [file2t, false], result: chkTargetFalse},
  ];

  function buildFirstParam(paramType) {
    return function (conf) {
      var files = [];
      var title = [
        'Move files (as ',
        paramType === 'fn' ? 'function' : 'string',
        ') to ',
        conf.param[0] === nodir  ? 'a none existing' :
        conf.param[0] === file2t ? 'a parent file'   :
                                   'an existing',
        ' dir (override: ',
        conf.param[1] === true  ? 'true'  :
        conf.param[1] === false ? 'false' :
                                  'default',
        ')'
      ].join('');

      it(title, function (done) {
        if (paramType === 'fn') {
          var file = conf.param[0];
          conf.param[0] = function (f) {
            assert(f.match(new RegExp('^' + path.join(root, origin))), 'Path as a function get a path as param');
            return file;
          };
        }

        function end() {
          conf.result(files);
          done();
        }

        fs(path.join(origin, '*.*'))
          .pipe(fs.move.apply(fs, conf.param))
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
