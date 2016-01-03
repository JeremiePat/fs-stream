fs-stream
===============================================================================

A wrapper and a set of utilities around [glob-stream](https://www.npmjs.com/package/glob-stream) to handle simple files manipulation through streams.

API
-------------------------------------------------------------------------------

### _module_(globPattern, [options])

Return a stream of file and dir. For a full documentation of `options` and glob pattern, go read the [glob-stream documentation](https://github.com/gulpjs/glob-stream).

### copy(dir, [options])

Copy all the files in the stream. `dir` can be:

* `String`: The path to the directory where to copy all the files
* `Function`: This function get the actual path to the file and must return the path to the directory where the file must be copied.

> **NOTE:** _relative path are resolved against the same base `cwd` as the one used to set up the stream._

The optional `options` parameter is an object with the following optionnal keys:
* `override`: A boolean indicating if the copy must override an existing file with the same name as the new one (default: **false**)
* `add`: A boolean indicating if the copied file must be added to the stream. (default: **false**)

```js
var fs = require('fs-stream');

fs('/files/*.md')
  .pipe(fs.copy('/files/markdown'), {add: true});
```

