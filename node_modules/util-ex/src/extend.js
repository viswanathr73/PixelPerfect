var isArray = require('./is/type/array');
var isFunction = require('./is/type/function');

/**
 * A filter function used to determine which properties to copy.
 * @callback FilterFn
 * @param {any} key
 * @param {any} value
 * @returns {boolean} returns `true` for properties to be copied.
 */

/**
 *   Extends an object with properties from one or more source objects.
 *   @param {Object} dest - The object to be extended.
 *   @param {Object|Object[]} sources - The source object(s) from which to extend the `dest` object.
 *   @param {function=} filter - An optional function to filter which properties to extend. It should take two arguments (`key` and `value`) and return `true` if the property should be extended, `false` otherwise.
 *   @returns {Object} - The extended `dest` object.
 * @example
 * var dest = { a: 1 };
 * var src1 = { b: 2 };
 * var src2 = { c: 3 };
 * extend(dest, src1, src2);
 * // dest => { a: 1, b: 2, c: 3 }
 *
 * @example
 * var dest = { a: 1 };
 * var src1 = { b: 2 };
 * var src2 = { c: 3 };
 * var filter = function(key, value) {
 *   return key !== 'b';
 * };
 * extend(dest, [src1, src2], filter);
 * // dest => { a: 1, c: 3 }
 */
module.exports = function extend(dest, sources, filter) {
  var i, j, k, key, keys, l, len, len1, len2, len3, src, value;
  if (!isArray(sources)) {
    sources = [sources];
  }
  if (isFunction(filter)) {
    for (i = 0, len = sources.length; i < len; i++) {
      src = sources[i];
      if (!(src && src instanceof Object)) {
        continue;
      }
      keys = Object.keys(src);
      for (j = 0, len1 = keys.length; j < len1; j++) {
        key = keys[j];
        value = src[key];
        if (filter(key, value)) {
          dest[key] = value;
        }
      }
    }
  } else {
    for (k = 0, len2 = sources.length; k < len2; k++) {
      src = sources[k];
      if (!(src && src instanceof Object)) {
        continue;
      }
      keys = Object.keys(src);
      for (l = 0, len3 = keys.length; l < len3; l++) {
        key = keys[l];
        dest[key] = src[key];
      }
    }
  }
  return dest;
};
