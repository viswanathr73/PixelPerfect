var getSuperCtor    = require("./getSuperCtor")

/**
 * Get the "root" class of the ctor
 *
 * @param {Function} ctor
 * @param {Function} [rootCtor] the root ctor need to be ignore, defaults to Object
 * @returns {Function}
 */
module.exports = function getRootCtor(ctor, rootCtor) {
  if (rootCtor == null) rootCtor = Object
  let superCtor = getSuperCtor(ctor)
  while (superCtor && superCtor !== rootCtor && superCtor !== Object) {
    ctor = superCtor
    superCtor  = getSuperCtor(ctor)
  }
  return ctor
}

