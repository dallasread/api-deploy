(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.MySampleAPI = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var AWS = window.AWS,
    API;

API = {
    debug: false,

    init: function init(lambda) {
        this.lambda = lambda || new AWS.Lambda();
    },

    invoke: function invoke(func, payload, done) {
        this.lambda.invoke({
            FunctionName: func,
            Payload: JSON.stringify(payload)
        }, function(err, data) {
            var payload;

            if (API.debug) console.log(func, err, data);

            if (err) return done(err);

            try {
                payload = JSON.parse(data.Payload);
            } catch (e) {}

            if ('errorMessage' in payload) return done(payload.errorMessage);

            done(null, payload);
        });
    }
};

API.hello = API.hello || {};

API.hello.world = function (data, done) {
    this.invoke('arn:aws:lambda:us-east-1:347191724861:function:MySampleAPI-Hello-World', data, done);
};
API.hello = API.hello || {};

API.hello.there = function (data, done) {
    this.invoke('arn:aws:lambda:us-east-1:347191724861:function:MySampleAPI-Hello-There', data, done);
};
API.hello = API.hello || {};

API.hello.there = function (data, done) {
    this.invoke('arn:aws:lambda:us-east-1:347191724861:function:MySampleAPI-Hello-There', data, done);
};
API.hello = API.hello || {};

API.hello.world = function (data, done) {
    this.invoke('arn:aws:lambda:us-east-1:347191724861:function:MySampleAPI-Hello-World', data, done);
};

if (window) window.MySampleAPI = API;
module.exports = API;

},{}]},{},[1])(1)
});