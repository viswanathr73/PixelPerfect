var toString = Object.prototype.toString;

/**
 * Determines whether a given value is an Array.
 *
 * @param {*} obj - The value to be checked.
 * @returns {boolean} `true` if the value is an Array, `false` otherwise.
 */
module.exports = Array.isArray ? Array.isArray : function isArray(obj) {
    return toString.call(obj) === "[object Array]";
  };
