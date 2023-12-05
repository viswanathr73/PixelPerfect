var isInheritedFromStr = require('./isInheritedFromStr')
var getSuperCtor = require('./getSuperCtor')

var getPrototypeOf      = Object.getPrototypeOf;
var objectSuperCtor     = getPrototypeOf(Object);

/**
 *   Determines if a constructor(class) is inherited from a given super constructor(class).
 *   @param {Function} ctor - The constructor function to check.
 *   @param {Function|string} superCtor - The super constructor to check for inheritance. Can be the name of the super constructor.
 *   @param {boolean=false} throwError - If true, an error will be thrown if a circular inheritance is found.
 *   @returns {boolean|Function} - If the constructor is inherited from the super constructor, returns the constructor.
 *   Otherwise, returns false.
 */
module.exports = function isInheritedFrom(ctor, superCtor, throwError) {
  if (typeof superCtor === 'string') {return isInheritedFromStr(ctor, superCtor, throwError);}
  if (ctor === superCtor) {
    if (throwError)
      throw new Error('Circular inherits found!');
    else
      return true;
  }
  var ctorSuper = getSuperCtor(ctor);
  var result  = ctorSuper === superCtor;
  var checked = [];
  checked.push(ctor);
  while (!result && ((ctor = ctorSuper) != null) && ctorSuper !== objectSuperCtor) {
    ctorSuper = getSuperCtor(ctor);

    if (checked.includes(ctor)) {
      if (throwError)
        throw new Error('Circular inherits found!');
      else
        return true;
    }
    checked.push(ctor);
    result = ctorSuper === superCtor;
  }
  if (result) {
    result = ctor;
    ctor = checked[0];
    if (ctor.mixinCtor_ === result) {result = ctor;}
  }

  return result;
}
