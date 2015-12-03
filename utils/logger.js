var gutil = require('gulp-util'),
    FIRST_ARG_LENGTH = 51;

function prepArgs(colour, args) {
    var arr = [],
        key;

    for (var i = args.length - 1; i >= 0; i--) {
        args[i] = gutil.colors[colour](args[i]);
    }

    if (args.length > 1 && args[0].length < FIRST_ARG_LENGTH) {
        args[0] = args[0] + Array(FIRST_ARG_LENGTH - args[0].length).join(' ');
    }

    for (key in args) {
        arr.push(args[key]);
    }

    return arr;
}

module.exports = {
    log: function log() {
        gutil.log.apply( null, prepArgs('blue', arguments) );
    },
    succeed: function succeed() {
        gutil.log.apply( null, prepArgs('green', arguments) );
    },
    error: function error(err) {
        throw new gutil.PluginError('APIDeploy', err, {
            showStack: true
        });
    },
    warn: function warn(err) {
        if (err instanceof Array) {
            err = new Error(prepArgs('red', err).join(' '));
        } else if (!(err instanceof Error)) {
            err = new Error(prepArgs('red', arguments).join(' '));
        }

        gutil.log.apply( null, prepArgs('red', [err.message]) );
        if (err.hint) gutil.log.apply( null, prepArgs('red', [err.hint]) );
    }
};
