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
    sdk: function sdk(done) {
        var _ = this,
            tmp = _.cfg['x-apiDeploy'].sdk.path + '.tmp',
            sdkPath = _.cfg['x-apiDeploy'].sdk.path,
            method = _.cfg['x-apiDeploy'].sdk.method ? _.cfg['x-apiDeploy'].sdk.method : 'api-gateway',
            template = Handlebars.compile(
                fs.readFileSync(__dirname + '/templates/sdk/js/' + method + '.hbs', { encoding: 'utf8' })
            );

        if (!_.cfg['x-apiDeploy'].sdk.path) {
            _.logger.log('No output sdk path specified (apiDeploy.sdk.path in your config).');
            return done();
        }

        _.logger.log('Building SDK');

        if (fs.statSync(sdkPath).isFile()) {
            fs.unlinkSync(sdkPath);
        }

        fs.writeFileSync(tmp, template(_.cfg));

        browserify({
            standalone: _.cfg['x-apiDeploy'].sdk.name,
            entries: [tmp]
        })
        .bundle()
        .pipe(source(tmp))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(rename(sdkPath))
        .pipe(gulp.dest(Path.dirname(sdkPath)))
        .on('finish', function sdkComplete() {
            fs.unlinkSync(tmp);
            _.logger.log('Built SDK');
            typeof done === 'function' && done();
        });
    }
};
