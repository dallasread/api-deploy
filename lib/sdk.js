var fs = require('fs'),
    Handlebars = require('handlebars'),
    browserify = require('browserify');

module.exports = {
    sdk: function sdk(done) {
        var _ = this,
            tmp = _.cfg.apiDeploy.sdk.path + '.tmp',
            template = Handlebars.compile(
                fs.readFileSync(__dirname + '/templates/sdk.hbs', { encoding: 'utf8' })
            );

        if (!_.cfg.apiDeploy.sdk.path) {
            _.logger.log('No output sdk path specified (apiDeploy.sdk.path in your config).');
            return done();
        }

        _.logger.log('Building SDK');

        fs.writeFileSync(tmp, template(_.cfg));

        browserify({
            standalone: _.cfg.apiDeploy.sdk.name,
            entries: [tmp]
        })
        // .transform({
        //     global: true
        // }, __dirname + '/node_modules/uglifyify')
        .bundle()
        .pipe(fs.createWriteStream(_.cfg.apiDeploy.sdk.path))
        .on('finish', function sdkComplete() {
            fs.unlinkSync(tmp);
            _.logger.log('Built SDK');
            typeof done === 'function' && done();
        });
    }
};
