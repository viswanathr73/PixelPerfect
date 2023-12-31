var getOwnPropValue = require('./getOwnPropValue')
var getPrototypeOf = require('./getPrototypeOf');

/**
 * Returns the parent class constructor of a given constructor(class) or object.
 *
 * @param {Function|object} ctor The constructor function or object to get the parent class from.
 * @returns {Function|undefined|null} The parent class constructor or undefined/null if there is no parent class.
 */
function getParentClass(ctor) {
  var result;
  if (typeof ctor === 'object' && ctor !== null) {
    ctor = getPrototypeOf(ctor);
    ctor = getOwnPropValue(ctor, 'Class') || ctor.constructor;
  }

  if (typeof ctor === 'function') {
    result = getOwnPropValue(ctor, 'super_');
    if (!result) {
      result = getPrototypeOf(ctor.prototype);
      if (result) {
        result = getOwnPropValue(result, 'Class') || result.constructor;
        if (result === Function || result === Object) result = null;
      }
    }
  }
  return result;
}

module.exports = getParentClass
