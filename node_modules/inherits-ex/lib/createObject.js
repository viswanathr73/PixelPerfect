var setPrototypeOf    = require('./setPrototypeOf');
var hasNativeReflect = require('./isNativeReflectConstruct').hasNativeReflect

var arraySlice = Array.prototype.slice;
var defineProperty = Object.defineProperty;

/**
 * Creates a new instance of the given class using the specified arguments.
 * @param {Function} aClass - The class to instantiate.
 * @param {...*} args - The arguments to pass to the constructor of the class.
 * @returns {*} - A new instance of the class.
 * @example
 * // Define a class
 * class Person {
 *   constructor(name, age) {
 *    this.name = name;
 *    this.age = age;
 *   }
 * }
 * // Create a new instance of the Person class
 * const john = createObject(Person, 'John', 30);
 * console.log(john); // Output: Person { name: 'John', age: 30 }
 */
function createObject(aClass) {
  var result = new (Function.prototype.bind.apply(aClass, arguments));
  if (aClass !== Object && aClass !== Array && aClass !== RegExp) {
    var vPrototype = aClass.prototype;
    if (!vPrototype.hasOwnProperty('Class')) {
      defineProperty(vPrototype, 'Class', {
        value: aClass,
        configurable: true
      });
    }
    var vConstructor = vPrototype.constructor
    if (aClass !== vConstructor) {
      var args = arraySlice.call(arguments, 1);
      try {
        vConstructor.apply(result, args);
      } catch(err) {
        if (err instanceof TypeError && err.toString().lastIndexOf("invoked without 'new'") !== -1) {
          // TODO(BUG): Can not pass the result instance to the ES6 constructor
          if (hasNativeReflect) {
            result = Reflect.construct(vConstructor, args, aClass)
          } else {
            result = new vConstructor(...args);
            setPrototypeOf(result, vPrototype);
          }
        }
        else throw err
      }
    }
  }
  return result;
}

module.exports = createObject
