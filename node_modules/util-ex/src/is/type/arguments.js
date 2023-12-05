var argsClass = '[object Arguments]';

/**
 * Checks if a value is an `arguments` object.
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object, else `false`.
 * @example
 * ```js
 * function myFunction() {
 *   return isArguments(arguments);
 * }
 * console.log(myFunction()); // true, since the `arguments` object is an instance of `Arguments`
 * isArguments([1, 2, 3]); // => false
 * ```
 */
module.exports = function isArguments(value) {
  return value && typeof value == 'object' && typeof value.length == 'number' &&
    toString.call(value) == argsClass || false;
}

