var defineProperty = require('./defineProperty');

var getAllOwnKeys = Object.getOwnPropertyNames;
var getDescriptor = Object.getOwnPropertyDescriptor;

/**
 * Clone all own properties of a source object to a destination object.
 *
 * @summary Clones own properties from source object to destination object.
 *
 * @description
 * This function clones all own properties of a source object to a destination object.
 *
 * @param {Object} dest - The destination object to clone the properties to.
 * @param {Object} src - The source object to clone the properties from.
 *
 * @returns {Object} - The destination object with cloned properties from the source object.
 *
 * @example
 * var obj1 = { a: 1, b: 2 };
 * var obj2 = { c: 3 };
 *
 * clonePropertiesTo(obj2, obj1); // obj2 = { a: 1, b: 2, c: 3 }
 */
function clonePropertiesTo(dest, src) {
  var attr, i, k, len, ref;
  ref = getAllOwnKeys(src);
  for (i = 0, len = ref.length; i < len; i++) {
    k = ref[i];
    attr = getDescriptor(src, k);
    defineProperty(dest, k, void 0, attr);
  }
  return dest;
};

module.exports = clonePropertiesTo
