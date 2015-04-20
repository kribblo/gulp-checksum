var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

var path = require('path');

var crc = require('crc');
var base62 = require('base62');

const PLUGIN_NAME = 'gulp-checksum';

var resourcePaths = {};

function resources() {
	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			cb(null, file);
		}

		if (file.isStream()) {
			throw new PluginError(PLUGIN_NAME, 'Streams are not supported: ' + file.path);
		}

		if (file.isBuffer()) {
			var crc32 = crc.crc32(file.contents);
			var checksum = base62.encode(crc32);

			var checksummedPath = path.join(path.dirname(file.path), checksum + '.' + path.basename(file.path));

			resourcePaths[file.path] = checksummedPath;

			file.path = checksummedPath;

			this.push(file);
			return cb();
		}

		cb(null, file);

	});

}

function references() {
	return through.obj(function (file, enc, cb) {

		if (file.isNull()) {
			cb(null, file);
		}

		if (file.isStream()) {
			throw new PluginError(PLUGIN_NAME, 'Streams are not supported: ' + file.path);
		}

		if (file.isBuffer()) {

			var contents = file.contents.toString(enc);
			var dirname = path.dirname(file.path);

			var resourceSrcOrHrefRegexp = /(?:href|src)\s*=\s*(['"])([^'"]+)\1/g;

			var match;
			while (match = resourceSrcOrHrefRegexp.exec(contents)) {
				var relativeResourcePath = match[2];

				var absoluteResourcePath = path.resolve(dirname, relativeResourcePath);

				var absoluteChecksummedPath = resourcePaths[absoluteResourcePath];

				if (absoluteChecksummedPath) {
					var relativeChecksummedPath = path.relative(dirname, absoluteChecksummedPath);
					var relativeResourceRegexp = new RegExp('([\'"])' + relativeResourcePath + '\\1');
					contents = contents.replace(relativeResourceRegexp, '$1' + relativeChecksummedPath + '$1');
				}
			}

			file.contents = new Buffer(contents, enc);
			this.push(file);
			return cb();
		}

		cb(null, file);
	});
}

module.exports = {
	PLUGIN_NAME: PLUGIN_NAME,
	resources: resources,
	references: references
};
