module.exports = function prepPath(path, options) {
    var joiner = typeof options.joiner === 'string' ? options.joiner : '-';

    if (options.camelCase) {
        joiner = '';
    }

    path = path
        .replace(/\.js$/, '')
        .replace(/^\.\//, '')
        .split('/').map(function(item) {
            if (options.camelCase || options.humanize) {
                item = item.replace('.', '');
                return item.charAt(0).toUpperCase() + item.slice(1);
            } else {
                return item;
            }
        }).join(joiner);

    if (typeof options.prefix === 'string') {
        path = options.prefix + joiner + path;
    }

    if (options.camelCase) {
        path = path.charAt(0).toLowerCase() + path.slice(1);
    }

    return path;
};
