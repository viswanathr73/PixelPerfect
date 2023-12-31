var int = /^(?:[-+]?(?:0|(?:0[xX])?[0-9]*))$/;

/**
 *   Checks if a given string represents an integer number.
 *   @param {string} str - The string to check.
 *   @returns {boolean} Whether or not the string represents an integer.
 *   @example
 *   isInt('42'); // true
 *   isInt('0'); // true
 *   isInt('-123'); // true
 *   isInt('12.3'); // false
 *   isInt('1e3'); // false
 */
module.exports = function isInt(str) {
  return str !== '' && int.test(str);
};
