module.exports = function prepPath(path, options) {
    options = options || {};

    path = path
        .replace(/[^A-Za-z0-9\/]/g, '')
        .replace(/^\//g, '')
        .replace('/indexjs', '')
        .split('/').map(function(item) {
            if (options.humanize) {
                return item.charAt(0).toUpperCase() + item.slice(1);
            } else {
                return item;
            }
        });

    return (options.prefix || '') + path.join(options.joiner || '-');
};
