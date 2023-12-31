var getOwnPropertyNames = Object.getOwnPropertyNames;

/**
 *
 * @callback CloneFilterFn
 * @param {string} name
 * @param {any} value
 * @returns {any} return value if include
 */

/**
 * Clone own properties from src to dest
 *
 * @param {object} dest
 * @param {object} src
 * @param {CloneFilterFn} filter
 * @returns {object} the dest object
 */
module.exports = function _clone(dest, src, filter) {
  var names = getOwnPropertyNames(src);

  for (var i = 0; i < names.length; i++ ) {
    var k = names[i];
    var value = filter(k, src[k]);
    if (value !== undefined) {dest[k] = value;}
  }
  return dest;
}
