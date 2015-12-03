(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.MySampleAPI = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var API_FILL_REGEX = /[{]([^}]*)[}]/g;

function API_FILL_URL(url, data) {
    return url.replace(API_FILL_REGEX, function (match, p1, offset, string) {
        return (data && data.params && data.params[p1]) || '';
    }) + (data.query ? ('?' + $.param(data.query)) : '');
}

var API = {
    debug: false,
    init: function() {}
};

API.hello = API.hello || {};

API.hello.world = function (data, done) {
    data = data || {};

    if (!done && this.debug) {
        console.warn('No callback supplied.');
    }

    $.ajax({
        method: 'GET',
        url: API_FILL_URL('http://localhost:8000/hello', data),
        data: 'GET' === 'GET' ? undefined : JSON.stringify(data.payload),
        contentType: 'application/json; charset=utf-8',
        beforeSend: function (xhr) {
            for (var key in data.headers) {
                xhr.setRequestHeader(key, data.headers[key]);
            }
        },
        complete: function(response) {
            if (response.responseJSON) {
                if (response.responseJSON.errorMessage) {
                    typeof done === 'function' && done(response.responseJSON, null);
                } else {
                    typeof done === 'function' && done(null, response.responseJSON);
                }
            } else {
                typeof done === 'function' && done(new Error('Could not complete network request.'));
            }
        }
    });
};
API.hello = API.hello || {};

API.hello.there = function (data, done) {
    data = data || {};

    if (!done && this.debug) {
        console.warn('No callback supplied.');
    }

    $.ajax({
        method: 'PATCH',
        url: API_FILL_URL('http://localhost:8000/hello/there', data),
        data: 'PATCH' === 'GET' ? undefined : JSON.stringify(data.payload),
        contentType: 'application/json; charset=utf-8',
        beforeSend: function (xhr) {
            for (var key in data.headers) {
                xhr.setRequestHeader(key, data.headers[key]);
            }
        },
        complete: function(response) {
            if (response.responseJSON) {
                if (response.responseJSON.errorMessage) {
                    typeof done === 'function' && done(response.responseJSON, null);
                } else {
                    typeof done === 'function' && done(null, response.responseJSON);
                }
            } else {
                typeof done === 'function' && done(new Error('Could not complete network request.'));
            }
        }
    });
};
API.hello = API.hello || {};

API.hello.there = function (data, done) {
    data = data || {};

    if (!done && this.debug) {
        console.warn('No callback supplied.');
    }

    $.ajax({
        method: 'DELETE',
        url: API_FILL_URL('http://localhost:8000/hello/there', data),
        data: 'DELETE' === 'GET' ? undefined : JSON.stringify(data.payload),
        contentType: 'application/json; charset=utf-8',
        beforeSend: function (xhr) {
            for (var key in data.headers) {
                xhr.setRequestHeader(key, data.headers[key]);
            }
        },
        complete: function(response) {
            if (response.responseJSON) {
                if (response.responseJSON.errorMessage) {
                    typeof done === 'function' && done(response.responseJSON, null);
                } else {
                    typeof done === 'function' && done(null, response.responseJSON);
                }
            } else {
                typeof done === 'function' && done(new Error('Could not complete network request.'));
            }
        }
    });
};
API.hello = API.hello || {};

API.hello.world = function (data, done) {
    data = data || {};

    if (!done && this.debug) {
        console.warn('No callback supplied.');
    }

    $.ajax({
        method: 'POST',
        url: API_FILL_URL('http://localhost:8000/hello/world', data),
        data: 'POST' === 'GET' ? undefined : JSON.stringify(data.payload),
        contentType: 'application/json; charset=utf-8',
        beforeSend: function (xhr) {
            for (var key in data.headers) {
                xhr.setRequestHeader(key, data.headers[key]);
            }
        },
        complete: function(response) {
            if (response.responseJSON) {
                if (response.responseJSON.errorMessage) {
                    typeof done === 'function' && done(response.responseJSON, null);
                } else {
                    typeof done === 'function' && done(null, response.responseJSON);
                }
            } else {
                typeof done === 'function' && done(new Error('Could not complete network request.'));
            }
        }
    });
};

if (typeof window !== 'undefined') window.MySampleAPI = API;
module.exports = API;

},{}]},{},[1])(1)
});