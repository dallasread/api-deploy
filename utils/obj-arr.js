var Generator = require('generate-js');

var ObjArr = Generator.generate(function ObjArr(data) {
    var _ = this;

    _.defineProperties({
        configurable: true,
        enumerable: true,
        writable: true
    }, data);
});

function sortObj(a, b, a_key, b_key) {
    if (a_key < b_key) return -1;
    if (a_key > b_key) return  1;

    return 0;
}


ObjArr.definePrototype({
    shift: function shift() {
        var _ = this,
            result = {};

        for (var k in _) {
            if (!_.hasOwnProperty(k)) continue;

            result[k] = _[k];
            delete _[k];

            return result;
        }
    },
    unshift: function unshift(obj) {
        var _ = this,
            back = {};

        for (var k in _) {
            if (!_.hasOwnProperty(k)) continue;

            back[k] = _[k];
            delete _[k];
        }

        for (k in obj) {
            if (!obj.hasOwnProperty(k)) continue;

            _[k] = obj[k];
        }

        for (k in back) {
            if (!back.hasOwnProperty(k)) continue;

            if (!(k in _)) {
                _[k] = back[k];
            }
        }

        return _;
    },
    pop: function pop() {
        var _ = this,
            result = {},
            last_key;

        for (var k in _) {
            if (!_.hasOwnProperty(k)) continue;
            last_key = k;
        }

        if (typeof last_key === 'string') {
            result[last_key] = _[last_key];
            delete _[last_key];
        }

        return result;
    },
    push: function push(obj) {
        var _ = this,
            k;

        for (k in obj) {
            if (!obj.hasOwnProperty(k)) continue;

            _[k] = obj[k];
        }

        return _;
    },
    slice: function slice(start_key, end_key) {
        var _ = this,
            result = {},
            s = false;

        for (var k in _) {
            if (!_.hasOwnProperty(k)) continue;

            if (k === start_key) s = true;

            if (k === end_key) {
                break;
            }

            if (s) {
                result[k] = _[k];
            }
        }

        return result;
    },
    splice: function splice(start_key, many, obj) {
        var _ = this,
            result = {},
            back = {},
            s = false;

        for (var k in _) {
            if (!_.hasOwnProperty(k)) continue;

            if (k === start_key) s = true;

            if (s && many < 0) {
                back[k] = _[k];
                delete _[k];
            } else if (s && --many >= 0) {
                result[k] = _[k];
                delete _[k];
            }
        }

        for (k in obj) {
            if (!obj.hasOwnProperty(k)) continue;

            _[k] = obj[k];
        }

        for (k in back) {
            if (!back.hasOwnProperty(k)) continue;

            if (!(k in _)) {
                _[k] = back[k];
            }
        }

        return result;
    },
    sort: function sort(func, this_arg, mutate) {
        var _ = this,
            arr = [],
            result = {},
            item;

        func = func || sortObj;

        for (var key in _) {
            item = _[key];
            item['ObjArr sort key'] = key;
            if (mutate) delete _[key];

            arr.push(item);
        }

        this_arg = this_arg || _;

        arr = arr.sort(function sortObjFunc(a, b) {
            return func.call(this_arg, a, b, a['ObjArr sort key'], b['ObjArr sort key']);
        });

        for (var i = 0; i < arr.length; i++) {
            item = arr[i];
            key = item['ObjArr sort key'];
            delete item['ObjArr sort key'];

            if (mutate) {
                _[key] = item;
            } else {
                result[key] = item;
            }
        }

        // console.log(arr);

        return mutate ? _ : result;
    },
    filter: function filter(func, this_arg, mutate) {
        var _ = this,
            result = {};

            this_arg = this_arg || _;

        for (var k in _) {
            if (!_.hasOwnProperty(k)) continue;

            if (func.call(this_arg, _[k], k, _)) {
                result[k] = _[k];
            } else if (mutate) {
                delete _[k];
            }
        }

        return mutate ? _ : result;
    },
});

module.exports = ObjArr;
