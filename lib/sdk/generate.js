var fs = require('fs'),
    Handlebars = require('handlebars'),
    Path = require('path'),
    gulp = require('gulp'),
    rename = require('gulp-rename'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    uglify = require('gulp-uglify');

module.exports = {
    generateSDK: function generateSDK(done) {
        var _ = this,
            paths = _.sdk.path,
            template = Handlebars.compile(
                fs.readFileSync(__dirname + '/templates/js/' + (_.sdk.type ? _.sdk.type : 'rest-api') + '.hbs', { encoding: 'utf8' })
            );

        _.generateSwagger();

        if (typeof paths === 'string') paths = [paths];

        var firstPath = paths.shift(),
            tmp = firstPath + '.tmp';

        if (!firstPath) {
            _.logger.log('No output sdk path specified (`sdk.path` in your config).');
            return done();
        }

        _.logger.log('Building SDK');

        try {
            fs.unlinkSync(firstPath);
        } catch (e) { }

        fs.writeFileSync(tmp, template({
            sdk: _.sdk,
            defaults: _.defaults,
            methods: _.getMethods()
        }));

        browserify({
            standalone: _.sdk.name,
            entries: [tmp]
        })
        .bundle()
        .pipe(source(tmp))
        .pipe(buffer())
        // .pipe(uglify(_.defaults.uglify))
        .pipe(rename(firstPath))
        .pipe(gulp.dest(Path.dirname(firstPath)))
        .on('finish', function sdkComplete() {
            fs.unlinkSync(tmp);

            for (var i = 0; i < paths.length; i++) {
                fs.createReadStream(firstPath).pipe(
                    fs.createWriteStream(paths[i])
                );
            }

            _.saveSwagger();

            _.logger.log('Built SDK');
            typeof done === 'function' && done();
        });
    }
};
