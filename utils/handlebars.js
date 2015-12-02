var handlebars = require('handlebars').create();

function dotterize(a, removeNamespace) {
    a = (a + '').toLowerCase().split('-');

    if (removeNamespace) {
        a.shift();
    }

    return a.join('.');
}

handlebars.registerHelper('downcase', function(a) {
    return a.toLowerCase();
});

handlebars.registerHelper('type-boolean', function(a) {
    return !!a + '';
});

handlebars.registerHelper('type-object', function(a) {
    return JSON.stringify(a || {});
});

handlebars.registerHelper('ensure-exists', function(namespace, a) {
    var path = dotterize(a, 1).split('.'),
        output = '',
        line;

    path.pop();

    for (var i = 0; i < path.length; i++) {
        line = namespace + '.' + path.slice(0, i + 1).join('.');
        output += line + ' = ' + line + ' || {};\n';
    }

    return output;
});

handlebars.registerHelper('dotterize', dotterize);

handlebars.registerHelper('upcase', function(a) {
    return a.toUpperCase();
});

module.exports = handlebars;
