var getSuperCtor    = require("./getSuperCtor")
var setPrototypeOf  = require("./setPrototypeOf")

//
/**
 * Get the Lowest Common Ancestor class of two constructors.
 *
 * @param {Function} ctor  First constructor
 * @param {Function} ctor2 Second constructor
 * @returns {Function|undefined} Lowest Common Ancestor class or undefined
 */
module.exports = function getClosestCommonAncestorCtor(ctor, ctor2) {
  const o = {}
  setPrototypeOf(o, ctor.prototype)
  while (ctor2 && ctor2 !== Object) {
    if (o instanceof ctor2) return ctor2
    ctor2 = getSuperCtor(ctor2)
  }
}
