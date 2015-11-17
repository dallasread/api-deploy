var fs = require('fs'),
    Handlebars = require('handlebars'),
    Path = require('path'),
    gulp = require('gulp'),
    gulpIf = require('gulp-if'),
    rename = require('gulp-rename'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    uglify = require('gulp-uglify');

module.exports = {
    generateSDK: function generateSDK(args, options, done) {
        var _ = this,
            paths = _.sdk.path,
            template = Handlebars.compile(
                fs.readFileSync(
                    (options.sdkTemplate && require('path').resolve(options.sdkTemplate)) ||
                    _.sdk.template ||
                    __dirname + '/templates/ajax.hbs',
                    { encoding: 'utf8' }
                )
            );

        if (typeof paths === 'string') paths = [paths];

        var firstPath = paths.shift(),
            tmp = firstPath + '.tmp';

        if (!firstPath) {
            _.APIDeploy.logger.log('No output sdk path specified (`sdk.path` in your config).');
            return done();
        }

        try {
            fs.unlinkSync(firstPath);
        } catch (e) { }

        var methods = [],
            method;

        _.APIDeploy.findMethods();

        for (var i = 0; i < _.APIDeploy.methods.length; i++) {
            method = _.APIDeploy.methods[i];
            methods.push(method);
        }

        fs.writeFileSync(tmp, template(_.templateData()));

        browserify({
            standalone: _.sdk.name,
            entries: [tmp]
        })
        .bundle()
        .pipe(source(tmp))
        .pipe(buffer())
        .pipe(gulpIf(!options.prettify, uglify(_.uglify)))
        .pipe(rename(firstPath))
        .pipe(gulp.dest(Path.dirname(firstPath)))
        .on('finish', function sdkComplete() {
            fs.unlinkSync(tmp);

            for (var i = 0; i < paths.length; i++) {
                fs.createReadStream(firstPath).pipe(
                    fs.createWriteStream(paths[i])
                );
            }

            _.APIDeploy.saveSwagger();

            typeof done === 'function' && done();
        });
    }
};