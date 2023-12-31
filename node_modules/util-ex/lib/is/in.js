var isRegExp = require('./type/regexp');

/**
 *   Checks if a string matches any item in a list of strings or regular expressions.
 *   @param {string} str - The string to match against the list.
 *   @param {Array<string|RegExp>} list - The list of strings or regular expressions to match against.
 *   @param {boolean=} caseSensitive - Whether the comparison should be case sensitive. Default is false.
 *   @returns {boolean} - True if there is a match, false otherwise.
 *
 * @example
 * const list = ['apple', 'banana', 'orange'];
 * const str = 'Banana';
 * console.log(isInList(str, list)); // true (no caseSensitive)
 * console.log(isInList(str, list, true)); // false (caseSensitive)
 */
module.exports = function isInList(str, list, caseSensitive) {
  var i, item, j, len, result;
  if (!caseSensitive) {
    str = str.toLowerCase();
  }
  for (i = j = 0, len = list.length; j < len; i = ++j) {
    item = list[i];
    if (isRegExp(item)) {
      if (!(caseSensitive || item.ignoreCase)) {
        list[i] = item = RegExp(item.source, 'i');
      }
      result = item.test(str);
      if (result) {
        break;
      }
    } else {
      item = item.toString();
      if (!caseSensitive) {
        item = item.toLowerCase();
      }
      result = item === str;
      if (result) {
        break;
      }
    }
  }
  return result;
};
