var float = /^(?:[-+]?(?:[0-9]+))?(?:\.[0-9]*)?(?:[eE][\+\-]?(?:[0-9]+))?$/;

/**
 * Checks if a string represents a valid floating point number.
 * @param {string} str The string to test.
 * @returns {boolean} `true` if the string represents a valid floating point number, `false` otherwise.
 * @example
 * isFloat('3.14'); // returns true
 * isFloat('-0.5'); // returns true
 * isFloat('2.718e0'); // returns true
 * isFloat('2.718e-2'); // returns true
 * isFloat('abc'); // returns false
 */
module.exports = function isFloat(str) {
  return str !== '' && float.test(str);
};
