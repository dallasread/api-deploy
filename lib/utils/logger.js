var gutil = require('gulp-util'),
    pluginName = 'API Deploy';

module.exports = {
    log: function() {
        var args = [];

        args.push(gutil.colors.blue(pluginName));
        args.push(gutil.colors.blue('-'));

        for (var key in arguments) {
            args.push(gutil.colors.blue(arguments[key]));
        }

        gutil.log.apply(null, args);
    },
    error: function(err) {
        this.log(
            gutil.colors.red(
                new gutil.PluginError(pluginName, err)
            )
        );
    },
    warn: function() {

    }
};
