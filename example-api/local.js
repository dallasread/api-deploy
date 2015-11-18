var AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-east-1'
});

AWS.config.credentials = new AWS.SharedIniFileCredentials({
    profile: 'default'
});

var Hapi = require('hapi'),
    server = new Hapi.Server(),
    lm = require('live-modules').createLiveModules(require);

server.connection({
    host: 'localhost',
    port: 8000,
    routes: { cors: true }
});

(function () {
    var endpoint;

    lm.require('./hello/world', 'hello', function (err, vrr, mod, status) {
        console.log('LiveModule', status, vrr);

        if (err) {
            console.log(err);
        } else {
            endpoint = global.hello;
        }
    });

    server.route({
        method: 'GET',
        path: '/hello',
        handler: function (request, reply) {
            var context = {
                    done: function(err, data) {
                        if (err) data = { error: err.message };
                        reply(null, data);
                    },
                    succeed: function(data) {
                        reply(null, data);
                    },
                    fail: function(err) {
                        reply(null, { error: err.message });
                    }
                },
                event = 'GET' === 'GET' ? request.query : request.payload,
                key;

            for (key in request.headers) {
                event[key] = request.headers[key];
            }

            for (key in request.params) {
                event[key] = request.params[key];
            }

            endpoint.handler(event, context);
        }
    });
}());
(function () {
    var endpoint;

    lm.require('./hello/world', 'helloWorld', function (err, vrr, mod, status) {
        console.log('LiveModule', status, vrr);

        if (err) {
            console.log(err);
        } else {
            endpoint = global.helloWorld;
        }
    });

    server.route({
        method: 'POST',
        path: '/hello/world',
        handler: function (request, reply) {
            var context = {
                    done: function(err, data) {
                        if (err) data = { error: err.message };
                        reply(null, data);
                    },
                    succeed: function(data) {
                        reply(null, data);
                    },
                    fail: function(err) {
                        reply(null, { error: err.message });
                    }
                },
                event = 'POST' === 'GET' ? request.query : request.payload,
                key;

            for (key in request.headers) {
                event[key] = request.headers[key];
            }

            for (key in request.params) {
                event[key] = request.params[key];
            }

            endpoint.handler(event, context);
        }
    });
}());
(function () {
    var endpoint;

    lm.require('./hello/there', 'helloThere', function (err, vrr, mod, status) {
        console.log('LiveModule', status, vrr);

        if (err) {
            console.log(err);
        } else {
            endpoint = global.helloThere;
        }
    });

    server.route({
        method: 'DELETE',
        path: '/hello/there',
        handler: function (request, reply) {
            var context = {
                    done: function(err, data) {
                        if (err) data = { error: err.message };
                        reply(null, data);
                    },
                    succeed: function(data) {
                        reply(null, data);
                    },
                    fail: function(err) {
                        reply(null, { error: err.message });
                    }
                },
                event = 'DELETE' === 'GET' ? request.query : request.payload,
                key;

            for (key in request.headers) {
                event[key] = request.headers[key];
            }

            for (key in request.params) {
                event[key] = request.params[key];
            }

            endpoint.handler(event, context);
        }
    });
}());
(function () {
    var endpoint;

    lm.require('./hello/there', 'helloThere', function (err, vrr, mod, status) {
        console.log('LiveModule', status, vrr);

        if (err) {
            console.log(err);
        } else {
            endpoint = global.helloThere;
        }
    });

    server.route({
        method: 'PATCH',
        path: '/hello/there',
        handler: function (request, reply) {
            var context = {
                    done: function(err, data) {
                        if (err) data = { error: err.message };
                        reply(null, data);
                    },
                    succeed: function(data) {
                        reply(null, data);
                    },
                    fail: function(err) {
                        reply(null, { error: err.message });
                    }
                },
                event = 'PATCH' === 'GET' ? request.query : request.payload,
                key;

            for (key in request.headers) {
                event[key] = request.headers[key];
            }

            for (key in request.params) {
                event[key] = request.params[key];
            }

            endpoint.handler(event, context);
        }
    });
}());

server.start(function (err) {
    if (err) {
        throw err;
    }

    console.log('Server running at:', server.info.uri);
});
