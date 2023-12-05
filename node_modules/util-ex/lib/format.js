// var shims     = require('./_shims');
var inspect   = require('./inspect');
var isString  = require('./is/type/string');
var isNull    = require('./is/type/null');
var isObject  = require('./is/type/object');

var formatRegExp = /%[sdj%]/g;
/**
 * Formats a string using placeholder tokens.
 *
 * If the first argument is a string, it is treated as a format string that
 * specifies placeholders for the subsequent arguments, which will be inserted
 * into the string in place of the placeholders. The placeholders are
 * specified using '%s' for string, '%d' for number, and '%j' for JSON.
 *
 * If the first argument is not a string, all arguments will be inspected and
 * concatenated into a space-separated string.
 *
 * @param {string|any} f - The format string or object to be formatted.
 * @param {...any} args - The values to be inserted into the format string.
 * @returns {string} The formatted string.
 *
 * @example
 * format('%s %s', 'hello', 'world'); // 'hello world'
 * format('%d %s', 42, 'answer'); // '42 answer'
 * format('%j', { foo: 'bar' }); // '{"foo":"bar"}'
 * format('no placeholders', 'needed'); // 'no placeholders needed'
 */
function format(f) {
  var i;
  if (!isString(f)) {
    var objects = [];
    for (i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};

module.exports = format
