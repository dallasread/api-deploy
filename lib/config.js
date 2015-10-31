var AWS = require('aws-sdk'),
    Path = require('path');

module.exports = {
    config: function config(configPath) {
        configPath = Path.resolve(configPath);

        var _ = this,
            cfg = require( configPath );

        if (cfg['x-apiDeploy'].aws) {
            AWS.config.credentials = new AWS.SharedIniFileCredentials({
                profile: cfg['x-apiDeploy'].aws.profile
            });
        }

        AWS.config.update(cfg['x-apiDeploy'].aws);

        _.cfg = cfg;
        _.configPath = configPath;
        _.AWSLambda = new AWS.Lambda();

        return _;
    }
};
