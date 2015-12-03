module.exports = function JSONmerge(a, b, merged) {
    merged = merged || {};
    var key,
        item;

    for (key in a) {
        item = a[key];

        if (
            typeof item === 'boolean' ||
            typeof item === 'number' ||
            typeof item === 'string' ||
            item === null
        ) {
            merged[key] = item;
        } else if (Array.isArray(item)) {
            merged[key] = JSONmerge([], item, []);
        } else if (typeof item === 'object') {
            merged[key] = JSONmerge({}, item);
        }
    }

    for (key in b) {
        item = b[key];

        if (
            typeof item === 'string'
        ) {
            merged[key] = item || merged[key] || '';
        // } else if (
        //     item === null
        // ) {
        //     merged[key] = item || merged[key] || null;
        } else if (
            // typeof item === 'string' ||
            typeof item === 'boolean' ||
            typeof item === 'number' ||
            item === null
        ) {
            merged[key] = item;
        } else if (Array.isArray(item)) {
            if (Array.isArray(merged[key])) {
                merged[key] = JSONmerge(merged[key], item, []);
            } else {
                merged[key] = JSONmerge([], item, []);
            }
        } else if (typeof item === 'object') {
            if (Array.isArray(merged[key])) {
                merged[key] = JSONmerge({}, item);
            } else {
                merged[key] = JSONmerge(merged[key], item);
            }
        }
    }

    return merged;
};
