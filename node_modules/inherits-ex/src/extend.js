var _extend = require('./_extend');

/**
 * Extends the prototype of the given constructor with the prototypes of one or more super constructors.
 *
 * @param {function} ctor - The constructor to extend the prototype of.
 * @param {...function} superCtors - The super constructors whose prototypes should be copied onto the extended prototype.
 * @returns {function} The extended constructor `ctor`.
 */
function extend(ctor) {
  var prototypes = []
  for (var i = 0; i < arguments.length; i++) {
    prototypes.push(arguments[i].prototype)
  }
  _extend.apply(undefined, prototypes)
  ctor.prototype.constructor = ctor
  return ctor;
};

module.exports = extend
