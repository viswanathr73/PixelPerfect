/**
 * Determines whether the given string represents an empty constructor.
 *
 * @param {string} vStr - The string to check.
 * @returns {boolean} - Returns true if the string represents an empty constructor, otherwise false
 */
module.exports = function(aFunc) {
  return /^function\s*\S*\s*\((.|[\n\r\u2028\u2029])*\)\s*{[\s;]*}$/g.test(aFunc.toString());
};
