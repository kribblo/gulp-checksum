# gulp-checksum

Generates checksums out of static resources and renames the files accordingly - this makes a unique filename for each version of the file so that HTTP headers can be set to cache forever.

Can also update references to the resources with checksum using the `references()` call, just make sure that all calls to `resources()` is done before. *gulp-checksum* assumes HTML, and so looks for references in `href` and `src` attributes.

*gulp-checksum* correctly handles relative URLs, even if multiple resources in the tree have the same filename.

## Basic Example

```js
var gulp = require('gulp');
var checksum = require('gulp-checksum');

gulp.task('css', function () {
    return gulp.src('css/*.css')
        .pipe(checksum.resources())
        .pipe(gulp.dest('dist/css'));
});

gulp.task('html', ['css'], function () {
    return gulp.src('*.html')
        .pipe(checksum.references())
        .pipe(gulp.dest('dist'));
});
```

## Example with SASS, source maps and Mustache, changing the output paths on the way

*gulp-checksum* stores references as absolute paths internally, so it's important to call `resources()` and `references()` at the same point in the chain, so that paths will still match up. Also note that `sourcemaps.write()` is called after the rename, so that names will match properly. 

Source SASS files are in a `scss/` path but will be output under `css/` and the result from Mustache will have new file ending `.html`.

```js
var gulp = require('gulp');
var path = require('path');
var checksum = require('gulp-checksum');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var mustache = require('gulp-mustache');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('sass', function () {
	gulp.src('scss/*.scss')
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'compressed'}))
		.pipe(rename(function (path) {
			path.dirname = path.dirname.replace(/\bscss\b/, 'css');
		}))
		.pipe(checksum.resources())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(config.targetPath));
});

gulp.task('mustache', ['sass'], function () {
	gulp.src('templates/*.mustache')
			.pipe(mustache())
			.pipe(replace(/\bscss\/branding.scss\b/, 'css/branding.css'))
			.pipe(rename(function (path) {
				path.extname = '.html';
			}))
			.pipe(checksum.references())
	}
});
```

## Test

	npm test
	
