function merge(obj, path, value) {
    if (!obj) return null;




    for (var key in object) {
        if (typeof object[key] == 'object') {
            if (typeof source[key] == 'undefined')
                source[key] = {};

            _.deepExtend(source[key],object[key]);
        } else {
            _.extend(source,object);
        }
    }
};


module.exports = merge;
