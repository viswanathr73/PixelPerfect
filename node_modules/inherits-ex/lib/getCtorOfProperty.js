var getPrototypeOf = require('./getPrototypeOf');

/**
 * Traverses the prototype chain of a given class to find the class(ctor) that contains a given property, returning the real class that owns the property.
 * @param {Function} aClass The class to start the search from
 * @param {string} aPropertyName The name of the property
 * @returns {Function|undefined} return the class of OwnProperty, or undefined if not found
 */
module.exports = function getCtorOfOwnProperty(aClass, aPropertyName) {
  var result;
  var vPrototype = aClass.prototype;

  while (vPrototype && !vPrototype.hasOwnProperty(aPropertyName)) {
    vPrototype = getPrototypeOf(vPrototype);
  }
  if (vPrototype) {
    if (vPrototype.hasOwnProperty('Class')) {
      result = vPrototype.Class;
    } else {
      result = vPrototype.constructor;
    }
  }
  return result;
};
