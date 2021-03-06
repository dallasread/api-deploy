var https = require('https'),
    aws4 = require('aws4');

module.exports = {
    AWSRequest: function(data, done) {
        var _ = this,
            opts = {
                service: 'apigateway',
                region: _.aws.region,
                method: data.method,
                path: data.path
            };

        if (data.body) opts.body = JSON.stringify(data.body);

        opts = aws4.sign(opts, {
            accessKeyId: _.aws.accessKeyId,
            secretAccessKey: _.aws.secretAccessKey
        });

        var req = https.request(opts, function(res) {
            var body = '';

            res.on('data', function(d) {
                body += d;
            });

            res.on('end', function() {
                body = JSON.parse(body);
                if (body.logref) {
                    return done(body.message, null);
                }

                setTimeout(function() {
                    done(null, body);
                }, 1000);
            });
        });

        req.on('error', function(err) {
            done(null, null);
        });

        if (opts.body) req.write(opts.body);

        req.end();
    }
};
