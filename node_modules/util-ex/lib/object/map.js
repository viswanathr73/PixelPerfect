/* keys:
@param aOptions
  * enumerable: defaults to true
  * nonEnumerable: defaults to false
*/
var getOwnPropertyNames = Object.getOwnPropertyNames
var getObjectKeys = Object.keys

/**
 * Returns an array containing the values of all enumerable or non-enumerable properties of an object.
 *
 * @param {Object} aObject - The object to map properties from.
 * @param {Object} [aOptions] - Optional parameter to specify options for mapping.
 * @param {boolean} [aOptions.enumerable=true] - If true, enumerable properties are included in the mapping.
 * @param {boolean} [aOptions.nonEnumerable=false] - If true, non-enumerable properties are included in the mapping.
 * @returns {Array} An array containing the mapped property values.
 * @example
 * const myObj = {a: 1, b: 2, c: 3};
 * Object.defineProperty(myObj, 'p', {
 *   value: 'value2',
 *   enumerable: false
 * });
 *
 * // Returns [1, 2, 3]
 * const result1 = map(myObj);
 *
 * // Returns ['value2']
 * const result2 = map(myObj, {enumerable: false, nonEnumerable: true});
 */
module.exports = function map(aObject, aOptions) {
  var enumerable = true;
  var nonEnumerable = false;
  var result = [];
  var enumKeys;
  var keys;
  if (aOptions) {
    if (aOptions.enumerable != null) enumerable = aOptions.enumerable;
    if (aOptions.nonEnumerable != null) nonEnumerable = aOptions.nonEnumerable;
  }

  if (aObject && (enumerable || nonEnumerable)) {
    if (enumerable && !nonEnumerable) {
      keys = getObjectKeys(aObject);
    } else {
      keys = getOwnPropertyNames(aObject);
      if (!enumerable) {
        enumKeys = getObjectKeys(aObject);
        keys = keys.filter(function(k){return enumKeys.indexOf(k) < 0});
      }
    }
    keys.forEach(function(k){
      result.push(aObject[k]);
    });
  }
  return result;
};
