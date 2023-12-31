/*
 * Usage:
 *   var fn = _createFunction('function yourFuncName(arg1, arg2){log(arg1+arg2);}', {log:console.log});
 *
 *   _createFunction('function abc(){}');
 *   _createFunction('function abc(){}', {log:console.log})
 *   _createFunction('function abc(){}', ['log'], [console.log])
 *
 * fn.toString() is :
 * "function yourFuncName(arg1, arg2) {
 *    return log(arg1+arg2);
 *  }"
 */

var isArray = require('./is/type/array');
var isObject = require('./is/type/object');

/**
 * Create a function using the given body and scope.
 *
 * @param {string} body - The body of the function to create.
 * @param {object|string[]} [scope] - The scope of the function, as an object with key/value pairs or an array of strings.
 * @param {Array=} values - The values to use for the scope, if scope is an array.
 * @returns {function} - The created function.
 *
 * @example
 *   var fn = _createFunction('function yourFuncName(arg1, arg2){log(arg1+arg2);}', {log:console.log});
 *   fn(2,3); //print 5
 */
module.exports = function _createFunction(body, scope, values) {
  var keys;
  if (arguments.length === 1) {
    return Function('return ' + body)();
  } else {
    if (!isArray(scope) || !isArray(values)) {
      if (isObject(scope)) {
        keys = Object.keys(scope);
        values = keys.map(function(k) {
          return scope[k];
        });
        scope = keys;
      } else {
        values = [];
        scope = [];
      }
    }
    return Function(scope, 'return ' + body).apply(null, values);
  }
};
