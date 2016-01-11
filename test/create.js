'use strict';

var fsnode  = require('fs');
var fsx     = require('fs-extra');
var path    = require('path');
var through = require('through2');
var assert  = require('assert');

var fs = require('../index.js');


describe('create', function () {
  var root = path.resolve('test');
  var dir  = 'dir';

  after(function () {
    fsx.removeSync(path.join(root, dir));
  });

  var configuration = [
    {                             },
    {type: 'file'                 },
    {type: 'directory'            },
    {                   add: true },
    {type: 'file',      add: true },
    {type: 'directory', add: true },
    {                   add: false},
    {type: 'file',      add: false},
    {type: 'directory', add: false}
  ];

  function buildFirstParam(paramType) {
    return function (conf, i) {
      var type     = conf.type || 'file';
      var typeFn   = type === 'file' ? 'isFile' : 'isDirectory';
      var typeTile = 'The object created is a ' + type;

      var addType  = 'add' in conf ? conf.add ? 'true' : 'false' : 'default';
      var add      = addType === 'default' ? true : conf.add;
      var addTitle = [
        'The new ', type, ' is', (add ? ' ' : ' not '), 'part of the stream'
      ].join('');

      var filename = paramType + i + '.txt';
      var filepath = path.join(root, dir, filename);
      var filerel  = path.join(dir, filename);

      var title    = [
        'A new ', type, (conf.type ? ' (' : ' (implicite, '),
        paramType, ' path, opt.add === ', addType, ')'
      ].join('');

      var files = [];

      function inStream(exist) {
        if (exist) { return files.indexOf(filepath) > -1; }
        return files.indexOf(filepath) === -1;
      }

      it(title, function (done) {
        var file = filerel;

        if (paramType === 'fn') {
          file = function (f) {
            assert(f === root, 'Path as a function get a path as param');
            return filerel;
          };
        }

        function end() {
          assert(inStream(add), addTitle);

          fsnode.stat(filepath, function (err, stats) {
            var isGoodType = err ? false : stats[typeFn]();
            assert(isGoodType, typeTile);
            done();
          });
        }

        fs(root)
          .pipe(fs.create(file, conf))
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
