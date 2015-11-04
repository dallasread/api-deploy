(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.MySampleAPI = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var AWS = window.AWS,
    API;

var creds = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'me'
});

AWS.config.update({
    region: 'us-east-1',
    credentials: creds
});

creds.get(function (err, data) {
    API.debug && err && console.warn(err);
});

var lambda = new AWS.Lambda();

function invoke(func, payload, done) {
    lambda.invoke({
        FunctionName: func,
        Payload: JSON.stringify(payload)
    }, function(err, data) {
        var payload;

        if (API.debug) console.log(err, data);

        if (err) return done(err);

        try {
            payload = JSON.parse(data.Payload);
        } catch (e) {}

        if ('errorMessage' in payload) return done(payload.errorMessage);

        done(null, payload);
    });
}

API = {
    debug: false,

    hello: function hello(data, done) {
        invoke('', data, done);
    },
    hello: function hello(data, done) {
        invoke('', data, done);
    },
    helloThere: function helloThere(data, done) {
        invoke('', data, done);
    },
};

if (window) window.MySampleAPI = API;
module.exports = API;

},{}]},{},[1])(1)
});