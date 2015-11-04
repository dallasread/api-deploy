var async = require('async');

module.exports = {
    deploy: function deploy(options, done) {
        var _ = this;

        async.series([
            function deployLambdas(done) {
                _.deployLambdas(options.ids, done);
            },
            // function deployRestAPI(done) {
            //     _.deployRestAPI(options, done);
            // },
            function generateSDK(done) {
                _.generateSDK(done);
            },
        ], function(err, data) {
            if (err) _.logger.error(err);
            typeof done === 'function' && done(null, data);
        });
    }
};
