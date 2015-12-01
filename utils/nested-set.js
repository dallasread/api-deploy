module.exports = function nestedSet(obj, key, val) {
    var keySplat = key.split('.'),
        finalKey = keySplat.pop(),
        i;

    for (i = 0; i < keySplat.length; i++) {
        obj[keySplat[i]] = obj[keySplat[i]] || {};
        obj = obj[keySplat[i]];
    }

    obj[finalKey] = val;

    return val;
};
