/**
 * Determines if a string represents a valid JavaScript function.
 * @param {string} aFuncString - The string to test.
 * @returns {boolean} - True if the string represents a valid function, false otherwise.
 * @example
 * isFunction('function add(x, y) { return x + y; }') // true
 * isFunction('const x = 5;') // false
 */
module.exports = function isFunction(aFuncString) {
  var result = /^[;\s]*function(\s+\S*)?\s*\(.*\)\s*{.*}[;\s]*$/.test(aFuncString);
  return result;
};
