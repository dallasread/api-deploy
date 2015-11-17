var Generator = require('generate-js');

var Wrapper = Generator.generate(function Wrapper(data, options) {
    var _ = this;

    options = options || {};

    _.defineProperties({
        writable: true,
        enumerable: false
    }, {
        _path: options._path,
        _parent: options._parent,
        _method: options._method,
        _resource: options._resource,
        _isCORSOptions: options._isCORSOptions
    });

    _.defineProperties({
        data: data
    });
});

Wrapper.definePrototype({
    toJSON: function toJSON() {
        return JSON.stringify( this.data );
    }
});

module.exports = Wrapper;
