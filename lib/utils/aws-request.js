var https = require('https'),
    aws4 = require('aws4');

module.exports = function(data, done) {
    var opts = {
        service: 'apigateway',
        region: 'us-east-1',
        method: data.method,
        path: data.path
    };

    if (data.body) opts.body = JSON.stringify(data.body);

    opts = aws4.sign(opts, {
        accessKeyId: 'AKIAIPYIEOAUPHPTIWPA',
        secretAccessKey: '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'
    });

    var req = https.request(opts, function(res) {
        var body = '';

        res.on('data', function(d) {
            body += d;
        });

        res.on('end', function() {
            body = JSON.parse(body);
            if (body.logref) {
                console.error(body.message);
                return done(body, null);
            }
            return done(null, body);
        });
    });

    req.on('error', function(err) {
        done(err, null);
    });

    if (opts.body) req.write(opts.body);

    req.end();
};
