module.exports = function anyDifferent(newData, oldData, attrs) {
    newData = newData || {};
    oldData = oldData || {};

    for (var i = attrs.length - 1; i >= 0; i--) {
        if (newData[attrs[i]] !== oldData[attrs[i]]) {
            return true;
        }
    }

    return false;
};
