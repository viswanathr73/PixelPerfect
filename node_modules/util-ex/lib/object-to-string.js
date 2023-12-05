var o2s = Object.prototype.toString;

/**
 * The objectToString function returns a string representation of an object's type using the built-in Object.prototype.toString method.
 *
 * The method call Object.prototype.toString.call(o) will return a string in the format [object Type], where Type represents the object's type.
 *
 * For example, if o is an array, the function will return the string [object Array]. If o is a date object, it will return the string [object Date]. This can be useful for determining the type of an object, especially when dealing with values that may be of different types.
 *
 * @param {any} o - The object to get its type as a string.
 * @returns {string} - The type of the object as a string.
 *
 * @example
 * objectToString([]); // returns '[object Array]'
 * objectToString({}); // returns '[object Object]'
 */
module.exports = function objectToString(o) {
  return o2s.call(o);
}
