function prepKey(key) {
    return key
        .replace(/~/g, '~0')
        .replace(/\//g, '~1');
}

function unprepKey(key) {
    return key
        .replace(/~0/g, '~')
        .replace(/~1/g, '/');
}

function generatePath(prefix, key) {
    var beginsWith = prefix.split('^=');

    if (beginsWith.length > 1 && key.indexOf(beginsWith[1]) !== 0) {
        return false;
    }

    return '/' + prefix.replace(/\^=.+$/, '') + '/' + prepKey(key);
}

module.exports = function findPatchOperations(newData, oldData, stringUpdates, objectUpdates, arrayUpdates) {
    var patchOperations = [],
        obj, i, objName, oldObj, key, path, val, prefix, oldItem, booleanify, rawPrefix;

    arrayUpdates = arrayUpdates || [];
    stringUpdates = stringUpdates || [];
    objectUpdates = objectUpdates || [];

    for (i = arrayUpdates.length - 1; i >= 0; i--) {
        key = arrayUpdates[i];

        if (newData[key]) {
            patchOperations.push({
                op: 'replace',
                path: '/' + key,
                value: newData[key] || []
            });
        }
    }

    for (i = stringUpdates.length - 1; i >= 0; i--) {
        key = stringUpdates[i];

        if (newData[key] && newData[key] !== oldData[unprepKey(key)]) {
            patchOperations.push({
                op: 'replace',
                path: '/' + key,
                value: newData[key] + ''
            });
        }
    }

    for (i = objectUpdates.length - 1; i >= 0; i--) {
        booleanify = objectUpdates[i][0] === '!';
        rawPrefix = objectUpdates[i].replace(/^!/, '');
        objName = rawPrefix.replace(/\^=.+$/, '').replace(/\~.+$/g, '');
        obj = newData[objName] || {};
        oldObj = oldData[objName] || {};

        items:
        for (key in obj) {
            path = generatePath(rawPrefix, key);
            oldItem = oldObj[unprepKey(key)];
            val = booleanify ? !!obj[key] + '' : obj[key] + '';

            if (!path) continue items;

            if (oldItem) {
                if (oldItem !== obj[key]) {
                    patchOperations.push({
                        op: 'replace',
                        path: path,
                        value: val
                    });
                }
            } else {
                patchOperations.push({
                    op: 'add',
                    path: path,
                    value: val
                });
            }
        }

        for (key in oldObj) {
            if (!obj[prepKey(key)]) {
                path = generatePath(rawPrefix, key);

                if (!path) break;

                patchOperations.push({
                    op: 'remove',
                    path: path
                });

                // TODO: Should we really delete stuff on AWS? If no, do this:
                // obj[key] = oldObj[key];
            }
        }
    }

    return patchOperations;
};
