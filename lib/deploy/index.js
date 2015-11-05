var async = require('async');

module.exports = {
    deploy: function deploy(options, done) {
        var _ = this;

        async.series([
            function deployLambdas(done) {
                _.deployLambdas(options.ids, done);
            },
            function deployRestAPI(next) {
                _.deployRestAPI(options, next);
            },
            // function generateSDK(done) {
            //     _.generateSDK(done);
            // },
        ], done);
    }
};
