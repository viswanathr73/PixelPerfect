var isFloat = require('./float');
var isString = require('../type/string');

/**
 * Checks if a string is a valid JSON string.
 *
 * @param {string} v - The string to be checked.
 * @param {boolean=} almost - If true, only checks if the string is almost JSON-like. Defaults to false.
 * @returns {boolean} - Returns true if the string is valid JSON, false otherwise.
 *
 * @example
 * isJson('{"name": "John", "age": 30}'); // true
 * isJson('[1, 2, 3]'); // true
 * isJson('{"name": "John", "age": 30'); // false
 * isJson('This is not a JSON string.'); // false
 */
module.exports = function isJson(v, almost) {
  var lastIndex, result;
  result = isString(v) && (v = v.trim()) !== '';
  if (result) {
    lastIndex = v.length - 1;
    if (v[0] === '"') { // or v[0] is "'"
      result = v[lastIndex] === v[0];
      if (result) {
        return result;
      }
    } else if (v[0] === '{') {
      result = v[lastIndex] === '}';
    } else if (v[0] === '[') {
      result = v[lastIndex] === ']';
    } else {
      result = isFloat(v);
      if (result) {
        return result;
      }
    }
    if (result && !almost) {
      try {
        JSON.parse(v);
      } catch (error) {
        result = false;
      }
    }
  }
  return result;
};
