module.exports = {
    hasDeployedAPIGateway: function hasDeployedAPIGateway() {
        return this.cfg.paths['/'] && !!this.cfg.paths['/'].id;
    },

    shouldDeployAPIGateway: function shouldDeployAPIGateway() {
        return !!this.cfg['x-apiDeploy'].apiGateway;
    },

    createAPIGateway: function createAPIGateway(done) {
        var _ = this;

        _.cfg.paths['/'] = _.cfg.paths['/'] || {};
        _.cfg.paths['/']['x-apiDeploy'] = _.cfg.paths['/']['x-apiDeploy'] || {};
        _.cfg.paths['/']['x-apiDeploy'].apiGateway = _.cfg.paths['/']['x-apiDeploy'].apiGateway || {};
        _.cfg.paths['/']['x-apiDeploy'].apiGateway.id = 1234567;

        done();
    }
};
