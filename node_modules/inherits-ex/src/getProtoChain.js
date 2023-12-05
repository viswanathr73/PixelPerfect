var getPrototypeOf = require('./getPrototypeOf');
var getSuperCtor = require('./getSuperCtor')

var objectSuperCtor = getPrototypeOf(Object);

/**
 * Returns an array of the names of constructors in the prototype chain of the given constructor.
 *
 * **Note**: the `getProtoChain.maxDepth` for `mixinCtors` is 10, You can change it.
 *
 * @param {function} ctor - The constructor to get the prototype chain of.
 * @throws {Error} If the maximum depth of nesting is reached.
 * @returns {string[]} An array of the names of constructors in the prototype chain of the given constructor.
 *
 * @example
 *
 * // Define a class hierarchy
 * class Animal {}
 * class Mammal extends Animal {}
 * class Cat extends Mammal {}
 *
 * // Get the prototype chain of the Cat class
 * const protoChain = getProtoChain(Cat);
 * console.log(protoChain); // Output: ["Animal", "Mammal","Cat"]
 */
function getProtoChain(ctor, depth) {
  if (depth == null) {
    depth = 0;
  }
  if (depth >= getProtoChain.maxDepth) {
    throw new Error('The maximum depth of nesting is reached.');
  }
  var result = []
  var lastCtor;
  while (ctor && ctor !== Object) {
    var mCtors, name;
    if (lastCtor && (mCtors = lastCtor.mixinCtors_)) {
      mCtors = mCtors.map(function(m) {
        return getProtoChain(m, ++depth);
      });
      name = mCtors;
    } else {
      name = ctor.name;
    }
    lastCtor = ctor;
    ctor =getSuperCtor(ctor);
    result.push(name);
  }

  return result.reverse();
};

getProtoChain.maxDepth = 10;

module.exports = getProtoChain

