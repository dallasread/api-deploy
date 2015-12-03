function prepKey(key) {
    return key
        .replace(/~/, '~0')
        .replace(/\//, '~1');
}

function unprepKey(key) {
    return key
        .replace(/~0/, '~')
        .replace(/~1/, '/');
}

function generatePath(prefix, key) {
    var beginsWith = prefix.split('~=');

    if (beginsWith.length > 1 && key.indexOf(beginsWith[1]) !== 0) {
        return false;
    }

    return '/' + prefix + '/' + prepKey(key);
}

module.exports = function findPatchOperations(newData, oldData, stringUpdates, objectUpdates, arrayUpdates) {
    var patchOperations = [],
        obj, i, objName, oldObj, key, path, val, prefix, oldItem;

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
        prefix = objectUpdates[i];
        objName = prefix.replace(/\~.+$/g, '');
        obj = newData[objName] || {};
        oldObj = oldData[objName] || {};

        for (key in obj) {
            path = generatePath(prefix, key);
            oldItem = oldObj[unprepKey(key)];
            val = typeof obj[key] === 'object' ? JSON.stringify(obj[key], null, 4) : obj[key] + '';

            if (!path) break;

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
            if (!obj[key]) {
                path = generatePath(prefix, key);

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
