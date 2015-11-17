var Generator = require('generate-js');

var CommandLineParser = Generator.generate(
    /**
     * [CommandLineParser description]
     * @param {[type]} options [description]
     */
    function CommandLineParser(options) {
        var _ = this;

        _.defineProperties({
            options: options,
            parsedOptions: {}
        });

        for (var i = 0; i < _.options.length; i++) {
            _.parseOption(_.options[i]);
        }
    }
);

CommandLineParser.definePrototype({
    /**
     * Get information about an Argument
     * @param  {String} arg The argument string (eg. `-c`).
     * @return {Object}     Includes meta-data about the argument.
     */
    parseArg: function parseArg(arg) {
        var match = this.PARAMETER_TYPE.exec(arg) || [];

        return {
            long:  !!match[1],
            short: !!match[2],
            key:     match[3],
            value:  (!match[1] && !match[2]) ? arg : void(0)
        };
    },

    /**
     * Prepare options to be used.
     * @param  {Array}  arr  Available Options for the command line.
     * @return {Object}      The parsed option.
     */
    parseOption: function parseOption(arr) {
        var _ = this,
            match = this.PARAMETER_VALUE.exec(arr[1]) || [],
            opt = {
                description: arr[2],
                short:       arr[0],

                key:          match[1],
                value:    !!( match[2] || match[4] ),
                required: !!(!match[2] && match[4] ),
                many:     !!( match[3] || match[5] ),
            };

        if (_.parsedOptions[opt.key] || (opt.short.length && _.parsedOptions[opt.short])) {
            throw _.optionError('Invalid duplicated option: ', opt);
        } else {
            _.parsedOptions[opt.key] = opt;
            _.parsedOptions[opt.short] = opt;
        }

        return opt;
    },

    /**
     * Parses bash-style command line arguments
     * @param  {Array} args Array of command line arguments
     * @return {Object}     Contains argv, options, and error
     */
    parse: function parse(args) {
        var _ = this,
            argv = [],
            options = {},
            error = null;

        if (typeof args === 'string') {
            args = _.parseLine(args);
        }

        args = args || [];

        /**
         * Adds the formatted value to the Options object
         * @param  {String} key Flag key (long or short)
         * @return {Void}
         */
        function optionBuilder(key) {
            var opt = _.parsedOptions[key];

            if (!opt) {
                error = _.optionError('Invalid option: ', {
                    short: key.length === 1 ? key : void(0),
                    key: key.length > 1 ? key : void(0)
                });
                return;
            }

            if (opt.value) {
                i++;
                var nextArg = _.parseArg(args[i] || '');

                if (opt.many) {
                    options[opt.key] = options[opt.key] || [];
                }

                if (nextArg.value) {
                    if (opt.many) {
                        options[opt.key].push(nextArg.value);
                    } else {
                        if (options[opt.key]) {
                            error = _.optionError('Flag already set: ', opt);
                        } else {
                            options[opt.key] = nextArg.value;
                        }
                    }
                } else {
                    error = _.optionError('Invalid value supplied: ', opt);
                }
            } else if (options[opt.key]) {
                error = _.optionError('Flag already set: ', opt);
            } else {
                options[opt.key] = true;
            }
        }

        // Categorize Options and Args into their appropriate objects
        for (var i = 0; i < args.length; i++) {
            if (error) {
                break;
            }

            var parsedArg = _.parseArg(args[i]);

            if (parsedArg.long) {
                optionBuilder(parsedArg.key);
            } else if (parsedArg.short) {
                var flags = parsedArg.key;

                for (var n = 0; n < flags.length; n++) {
                    if (error) {
                        break;
                    }

                    optionBuilder(flags[n]);
                }
            } else {
                argv.push(parsedArg.value);
            }
        }

        if (!error) {
            for (var key in _.parsedOptions) {
                var opt = _.parsedOptions[key];
                if (opt.required && !options[opt.key]) {
                    error = _.optionError('Missing required option: ', opt);
                    break;
                }
            }
        }

        return {
            argv: argv,
            options: options,
            error: error
        };
    },

    /**
     * Line parser.
     * @param  {String} line Line input command.
     * @return {Array}       An array containing string args.
     */
    parseLine: function parseLine(line) {
        var args = [],
            startIndex,
            grouping = false,
            quoteChar = null,
            charCode = null;

            line = '' + line;

        for (var i = 0; i < line.length; i++) {
            charCode = line.charCodeAt(i);

            if (line[i] === quoteChar && line[i - 1] !== '\\') { // Check for ending quote group.
                args.push(line.slice(startIndex, i + 1));
                quoteChar = null;
            } else if (grouping && charCode <= 0x20) { // Check for ending non-whitespace group.
                args.push(line.slice(startIndex, i));
                grouping = false;
            } else if (!grouping && !quoteChar && (line[i] === '"' || line[i] === '\'')) { // Check for starting quote group.
                quoteChar = line[i];
                startIndex = i;
            } else if (!grouping && !quoteChar && charCode > 0x20) { // Check for starting non-whitespace group.
                grouping = true;
                startIndex = i;
            }
        }

        if (grouping || quoteChar) {
            args.push(line.slice(startIndex));
        }

        args = args.map(function consumeStrings(item) {
            var result;
            if (item[0] === item[item.length - 1] && (item[0] === '"' || item[0] === '\'')) {
                try {
                    result = JSON.parse('"'+item.slice(1, -1).replace(/([^\\])"/g, '$1\\\"').replace(/\\'/g, '\'') +'"');
                } catch (e) {
                    result = item;
                }
            } else {
                result = item;
            }
            return result;
        });

        args.delimited = args.length && /\s$/.test(line);
        args._raw = line;

        return args;
    },

    /**
     * Create an error
     * @param  {String} str The error to be returned
     * @param  {Object} opt Related option object
     * @return {Error}
     */
    optionError: function optionError(str, opt) {
        if (opt) {
            str += (opt.short ? '-' + opt.short : '') + (opt.short && opt.key ? ', ': '') + (opt.key ? '--' + opt.key : '');
        }

        return new Error(str);
    },

    /**
     * Option Parser Regex
     * @type {RegExp}
     * @1 key
     * @2 optional
     * @3 many
     * @4 required
     * @5 many
     */
    PARAMETER_VALUE: /^([0-9A-Z_\-a-z]+)(?:(\[\=[0-9A-Z_\-a-z]+(\+)?\])|(\=[0-9A-Z_\-a-z]+(\+)?))?$/,

    /**
     * Long/Short Regex
     * @type {RegExp}
     * @1 short
     * @2 long
     */
    PARAMETER_TYPE: /^(?:(\-\-)|(\-))([0-9A-Z_\-a-z]+)$/,
});

module.exports = CommandLineParser;

// c = CommandLineParser.create([
//     ['r', 'red[=ARG+]',   'Colors the output red.'],
//     ['g', 'green',        'Colors the output green.'],
//     ['b', 'blue',         'Colors the output blue.'],
// ]);

// c.parse(['echo', 'cats', '--red', 'car']);
