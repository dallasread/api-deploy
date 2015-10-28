module.exports = function prepPath(path, options) {
    path = path
        .replace(/\.js$/, '')
        .replace(/^\.\//, '')
        .split('/').map(function(item) {
            if (options.humanize) {
                item = item.replace('.', '');
                return item.charAt(0).toUpperCase() + item.slice(1);
            } else {
                return item;
            }
        });

    return (options.prefix ? options.prefix + '-' : '') + path.join(options.joiner || '-');
};
