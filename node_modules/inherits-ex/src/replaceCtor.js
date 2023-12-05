var getPrototypeOf = require('./getPrototypeOf');
var setPrototypeOf = require('./setPrototypeOf');
var defineProperty = Object.defineProperty;

//just replace the object's constructor

/**
 * Replace the prototype of an object with the prototype of a given class
 * @param {Object} aObject - The object whose prototype needs to be replaced
 * @param {Function} aClass - The class whose prototype should be used to replace the object's prototype
 * @returns {boolean} - Returns true if the object's prototype was successfully replaced, otherwise returns false
 *
 * @example
 *
 * class Person {
 *   constructor(name) {
 *     this.name = name;
 *   }
 *   greet() {
 *     console.log('Hello, my name is '+ this.name);
 *   }
 * }
 *
 * class Student {
 *   constructor(name, major) {
 *     super(name);
 *     this.major = major;
 *   }
 *   greet() {
 *     console.log("Hello, I'm student. My name is " + this.name);
 *   }
 * }
 * const mary = new Person('Mary');
 * mary.greet(); // logs "Hello, my name is Mary"
 * replaceCtor(mary, Student); // returns true
 * mary.greet(); // logs "Hello, I'm student. My name is Mary"
 */
module.exports = function replaceCtor(aObject, aClass) {
  var vOldProto = getPrototypeOf(aObject);
  var result = false;
  if ( vOldProto && vOldProto !== aClass.prototype) {
    if (!aClass.prototype.hasOwnProperty('Class')) {
      defineProperty(aClass.prototype, 'Class', {
        value: aClass,
        configurable: true
      });
    }
    setPrototypeOf(aObject, aClass.prototype);
    result = true;
  }
  return result;
}

