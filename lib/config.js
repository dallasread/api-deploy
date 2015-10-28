var AWS = require('aws-sdk'),
    Path = require('path');

module.exports = {
    config: function config(configPath) {
        configPath = Path.resolve(configPath);

        var _ = this,
            cfg = require( configPath );

        if (cfg.apiDeploy.defaults.aws) {
            AWS.config.credentials = new AWS.SharedIniFileCredentials({
                profile: cfg.apiDeploy.defaults.aws.profile
            });
        }

        AWS.config.update(cfg.apiDeploy.defaults.aws);

        _.cfg = cfg;
        _.configPath = configPath;
        _.AWSLambda = new AWS.Lambda();

        return _;
    }
};
