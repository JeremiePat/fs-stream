'use strict';

var fsnode  = require('fs');
var fsx     = require('fs-extra');
var path    = require('path');
var through = require('through2');
var assert  = require('assert');

var fs = require('../index.js');


describe('copy', function () {
  var origin = path.join('test', 'origin');
  var dest   = path.join('test', 'dest');
  var file1  = 'one.txt';
  var file2  = 'two.txt';
  var f1o    = path.resolve(path.join(origin, file1));
  var f1d    = path.resolve(path.join(dest,   file1));
  var f2o    = path.resolve(path.join(origin, file2));
  var f2d    = path.resolve(path.join(dest,   file2));

  before(function () {
    fsx.ensureDirSync(path.resolve(origin));
    fsx.ensureDirSync(path.resolve(dest));
  });

  after(function () {
    fsx.removeSync(path.resolve(origin));
    fsx.removeSync(path.resolve(dest));
  });

  beforeEach(function () {
    fsx.ensureFileSync(f1o);
    fsx.ensureFileSync(f2o);
    fsx.ensureFileSync(f2d);
    fsnode.writeFileSync(f2o, origin, 'utf8');
    fsnode.writeFileSync(f2d, dest,   'utf8');
  });

  afterEach(function () {
    fsx.removeSync(f1d);
  });

  var configuration = [
    {                           },
    {override: false, add: true },
    {override: true,  add: false},
    {override: false, add: false},
    {override: true,  add: true }
  ];

  function buildFirstParam(paramType) {
    return function (conf) {
      var addType  = 'add' in conf ? conf.add ? 'true' : 'false' : 'default';
      var add      = addType === 'default' ? false : conf.add;
      var addTitle = [
        'The copied field is', (add ? ' ' : ' not '), 'part of the stream'
      ].join('');

      var ovrType  = 'override' in conf ? conf.override ? 'true' : 'false' : 'default';
      var ovr      = ovrType === 'default' ? false : conf.override;
      var ovrTitle = [
        'The file has', (ovr ? ' ' : ' not ') ,'been overriden'
      ].join('');

      var files = [];

      var title    = [
        (ovr ? '2 files ' : '1 file '), 'has been copied',
        ' (', paramType, ' path, override: ', ovrType, ', add: ', addType, ')'
      ].join('');

      function inStream(exist, filepath) {
        if (exist) { return files.indexOf(filepath) > -1; }
        return files.indexOf(filepath) === -1;
      }

      function isOverriden(r) {
        if (r) { return fsnode.readFileSync(f2d, 'utf8') === origin; }
        return fsnode.readFileSync(f2d, 'utf8') === dest;
      }

      it (title, function (done) {
        var dir = dest;

        if (paramType === 'fn') {
          dir = function (f) {
            assert(f === f1o || f === f2o, 'Path as a function get a file path as param');
            return dest;
          };
        }

        function end() {
          assert(inStream(add, f1d), addTitle);
          assert(inStream(add, f2d), addTitle);
          assert(isOverriden(ovr), ovrTitle);
          done();
        }

        fs(path.join(origin, '*.*'))
          .pipe(fs.copy(dir, conf))
          .on('end', end)
          .on('error', done)
          .pipe(through.obj(function (file, e, cb) {
            files.push(file.path);

            cb(null, file);
          }));
      });
    };
  }

  configuration.forEach(buildFirstParam('string'));
  configuration.forEach(buildFirstParam('fn'));
});
