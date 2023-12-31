var getOwnPropValue = require('./getOwnPropValue')

var getPrototypeOf  = Object.getPrototypeOf;

/**
 * Return the Super Constructor of the ctor
 * @param {Function} ctor
 * @returns {Function}
 */
module.exports = function getSuperCtor(ctor) {
  var ctorSuper = getOwnPropValue(ctor, 'super_');
  if (!ctorSuper) {
    var ctorProto = ctor.prototype && getPrototypeOf(ctor.prototype);
    ctorSuper = ctorProto && (getOwnPropValue(ctorProto, 'Class') || ctorProto.constructor);
  }
  return ctorSuper;
}

