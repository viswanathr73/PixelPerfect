var getKeys = Object.keys;
var getOwnPropertyNames = Object.getOwnPropertyNames;

/**
 * Returns an array of non-enumerable property names of an object.
 *
 * @param {Object} aObject - The object to retrieve non-enumerable property names from.
 * @returns {Array.<string>} - An array of non-enumerable property names of the object.
 *
 * @example
 *
 * var obj = Object.create(null, {
 *   a: { value: 1 },
 *   b: { value: 2, enumerable: true }
 * });
 *
 * var nonEnumProps = getNonEnumerableNames(obj); // nonEnumProps = ['a']
 */
module.exports = function getNonEnumerableNames(aObject) {
  var keys, result;
  result = getOwnPropertyNames(aObject);
  if (result.length) {
    keys = getKeys(aObject);
    result = result.filter(function(k) {
      return keys.indexOf(k) === -1;
    });
  }
  return result;
};
