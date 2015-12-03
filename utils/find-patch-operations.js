function generatePath(prefix, key) {
    return '/' + prefix + '/' + key
        .replace(/~/, '~0')
        .replace(/\//, '~1');
}

module.exports = function findPatchOperations(newData, oldData, stringUpdates, objectUpdates, arrayUpdates) {
    var patchOperations = [],
        obj, i, objName, oldObj, key, path, val;

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

        if (newData[key] && newData[key] !== oldData[key]) {
            patchOperations.push({
                op: 'replace',
                path: '/' + key,
                value: newData[key] + ''
            });
        }
    }

    for (i = objectUpdates.length - 1; i >= 0; i--) {
        objName = objectUpdates[i];
        obj = newData[objName] || {};
        oldObj = oldData[objName] || {};

        for (key in obj) {
            path = generatePath(objName, key);
            val = typeof obj[key] === 'object' ? JSON.stringify(obj[key], null, 4) : obj[key];

            if (oldObj[key]) {
                if (oldObj[key] !== obj[key]) {
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
                patchOperations.push({
                    op: 'remove',
                    path: generatePath(objName, key)
                });

                // TODO: Should we really delete stuff on AWS? If no, do this:
                // obj[key] = oldObj[key];
            }
        }
    }

    return patchOperations;
};
