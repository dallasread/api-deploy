module.exports = function dashedCamelCase(str) {
    return str.replace(/\.js$/, '')
        .replace(/[^A-Za-z0-9-\/]/g, '')
        .replace(/[\/|-]+/g, '-')
        .split('-').map(function(item) {
            if (item.length) {
                return item.charAt(0).toUpperCase() + item.slice(1);
            }
        }).join('-');
};
