var isArray           = Array.isArray;
var isInheritedFrom   = require('./isInheritedFrom');
var inheritsDirectly  = require('./inheritsDirectly');
var getPrototypeOf    = require('./getPrototypeOf');
var defineProperty    = require('./defineProperty');
var getSuperCtor      = require('./getSuperCtor');
var getRootCtor       = require('./getRootCtor');
var getClosestCommonAncestorCtor= require('./getClosestCommonAncestorCtor');

/**
 * Inherit the prototype properties and methods from one constructor into another.
 *
 * @param {function} ctor the class which needs to inherit the prototype.
 * @param {function} superCtor the parent class to inherit prototype from.
 * @param {boolean=true} staticInherit whether allow static members inheritance, defaults to true.
 * @returns The function returns true if inheritance was successful.
 */
function _inherits(ctor, superCtor, staticInherit) {
  var v  = getSuperCtor(ctor);
  var mixinCtor = ctor.mixinCtor_;
  if (mixinCtor && v === mixinCtor) {
    ctor = mixinCtor;
    v = getSuperCtor(ctor);
  }
  var result = false;
  var isInherited = isInheritedFrom(ctor, superCtor)
  if (!isInherited && !isInheritedFrom(superCtor, ctor)) {
    inheritsDirectly(ctor, superCtor, staticInherit);
    var rootCtor = getClosestCommonAncestorCtor(v, superCtor)
    superCtor = getRootCtor(superCtor, rootCtor)
    if (v && v !== Object) inheritsDirectly(superCtor, v)
    result = true;
  } else if (isInherited) {
    // additional properties
    if (!ctor.hasOwnProperty('super_')) {
      defineProperty(ctor, 'super_', superCtor);
      defineProperty(ctor.prototype, 'Class', ctor)
    }
    if (!ctor.hasOwnProperty('__super__')) {
      defineProperty(ctor, '__super__', superCtor.prototype);
    }
  }
  return result;
}

/**
 * A powerful tool for implementing class inheritance that supports dynamic inheritance and multiple inheritance.
 *
 * **Features**:
 *
 * * Supports dynamic inheritance.
 * * Preserves existing methods and properties in the child class's prototype instead of overwriting them.
 * * Avoids circular dependencies by checking if the parent class has already inherited from the child class.
 * * Avoids duplicate inheritance by checking if the child class has already inherited from the parent class.
 * * Supports multiple inheritance by allowing an array of parent classes to be passed in.
 * * Optional static members inheritance.
 *
 * The function is compatible with both ES5 and ES6, as well as older browsers that do not support these
 * versions of JavaScript. The function also supports CoffeeScript-generated classes.
 *
 * **Note**:
 *
 * * When using the `inherits` function, these two properties are added to the constructor function(`ctor`).
 *   * The `super_` property refers to the parent constructor.
 *   * The `__super__` property refers to the parent's prototype object,
 *     which can be used for the `super` keyword in CoffeeScript.
 * * In addition, the `Class` property is added to the prototype object of the constructor function (`ctor`).
 *   * This property points to the current class(`ctor`).
 *   * This property can also be accessed by instances of the class.
 *   * It is important to note that for the empty constructor, the instance of `ctor` may not be the current class,
 *     but the `Class` property is always set to the current class for instance.
 *
 *
 * @param {Function} ctor the child class that needs to inherit from the parent class.
 * @param {Function|Function[]} superCtors the parent class that the child class needs to inherit from.
 *   The first class is the parent of child class ctor, the left classes will be chained(inherits) one by one,
 *   if `superCtors` is an array of classes.
 * @param {boolean=true} staticInherit optional indicating whether or not the static properties of the parent class should be inherited as well.
 * @returns {boolean} returns true if inheritance was successful.
 *
 * @example
 *
 * class Animal {
 *   constructor(name) {
 *     this.name = name;
 *   }
 *
 *   speak() {
 *     console.log(this.name + ' makes a noise.');
 *   }
 * }
 *
 * class Dog extends Animal {
 *   constructor(name, breed) {
 *     super(name);
 *     this.breed = breed;
 *   }
 *
 *   speak() {
 *     console.log(this.name + ' barks.');
 *   }
 * }
 *
 * function Cat(name, breed) {
 *   this.name = name;
 *   this.breed = breed;
 * }
 *
 * Cat.prototype.meow = function() {
 *   console.log(this.name + ' meows.');
 * };
 *
 * inherits(Cat, [Animal]);
 *
 * const fluffy = new Cat('Fluffy', 'Siamese');
 * fluffy.speak(); // Output: Fluffy makes a noise.
 * fluffy.meow(); // Output: Fluffy meows.
 */
module.exports = function inherits(ctor, superCtors, staticInherit) {
  if (!isArray(superCtors)) return _inherits(ctor, superCtors, staticInherit);
  for (var i = superCtors.length - 1; i >= 0; i--) {
    if (!_inherits(ctor, superCtors[i], staticInherit)) return false;
  }
  return true;
}
