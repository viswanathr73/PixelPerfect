var isObject = require('./object');
var objectToString = require('../../object-to-string');
var dateClass = '[object Date]';

/**
 *   Determines whether a value is a date object.
 *   @param {any} d - The value to check.
 *   @returns {boolean} - Returns `true` if `d` is a date object, else `false`.
 */
module.exports = function isDate(d) {
  return isObject(d) && objectToString(d) === dateClass;
}

