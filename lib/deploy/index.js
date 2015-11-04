var async = require('async');

module.exports = {
    deploy: function deploy(ids, done) {
        var _ = this;

        async.series([
            function deployLambdas(done) {
                _.deployLambdas(ids, done);
            },
            // function buildRestAPI(done) {
            //     _.buildRestAPI(ids, done);
            // },
            function generateSDK(done) {
                _.generateSDK(done);
            },
        ], function(err, data) {
            if (err) _.logger.error(err);
            done(null, data);
        });
    }
};
