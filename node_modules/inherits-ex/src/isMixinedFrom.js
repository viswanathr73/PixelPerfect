var isMixinedFromStr = require('./isMixinedFromStr');

/**
 * Check if a constructor is mixed from a specific constructor.
 * @param {function} ctor - The constructor to check.
 * @param {function|string} superCtor - The constructor to check if the `ctor` is mixed from.  Can be the name of the constructor.
 * @returns {boolean} - True if `ctor` is mixed from `superCtor`, otherwise false.
 */
module.exports = function isMixinedFrom(ctor, superCtor) {
  if (typeof superCtor === 'string') return isMixinedFromStr(ctor, superCtor);
  var mixinCtors = ctor.mixinCtors_;
  var result = false;
  if (mixinCtors) {
    result = mixinCtors.indexOf(superCtor);
    result = result >= 0;
  }
  return result;
};
