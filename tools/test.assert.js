'use strict';

var fs     = require('fs');
var assert = require('assert');

function chkFile(path) {
  try {
    fs.accessSync(path, fs.R_OK);
    return true;
  } catch (e) {
    return false;
  }
}

function fileExist(file, expected) {
  assert.strictEqual(chkFile(file), expected, 'File exist: ' + file);
}

function fileInStream(files, file, expected) {
  var inside = files.indexOf(file) !== -1;
  assert.strictEqual(inside, expected, 'File is in the stream: ' + file);
}

function fileHasContent(file, content, expected) {
  var current = fs.readFileSync(file, 'utf8');

  if (expected) {
    assert.strictEqual(current, content, 'File has the right content: ' + file);
  } else {
    assert.notStrictEqual(current, content, 'File has a different content: ' + file);
  }
}

function isDirOrFile(path, type) {
  var stats = fs.statSync(path);

  if (type === 'file') {
    assert.ok(stats.isFile(), path + ' is a file');
  } else {
    assert.ok(stats.isDirectory(), path + ' is a directory');
  }
}

function pathMatch(path, rgx) {
  assert(rgx.test(path), path + ' match ' + rgx);
}

function streamLength(files, length, expected) {
  var ok = files.length === length;
  assert.strictEqual(ok, expected, 'We had ' + length + ' files in the stream');
}

module.exports = {
  fileExist     : fileExist,
  fileInStream  : fileInStream,
  fileHasContent: fileHasContent,
  isDirOrFile   : isDirOrFile,
  pathMatch     : pathMatch,
  streamLength  : streamLength,
};
