var getConstructor = require('./getConstructor');
var isEmptyFunction = require('./isEmptyFunction');
var _clone = require('./_clone');

/**
 *  Creates a new object with a prototype chain from a given class and constructor function.
 *
 * **Note**: Not used more for can not overwrite the prototype of ctor.
 *  @param {Function} aClass - The class to use as prototype chain.
 *  @param {Function} [aConstructor] - The constructor function for the new object.
 *  @returns {Object} - The newly created prototype object.
 */
module.exports = function newPrototype(aClass, aConstructor) {
  //Object.create(prototype) only for ES5
  //Object.create(prototype, initProps) only for ES6
  //For Browser not support ES5/6:
  //  var Object = function() { this.constructor = aConstructor; };
  //  Object.prototype = aClass.prototype;
  //  return new Object();
  var ctor = isEmptyFunction(aConstructor) ? getConstructor(aClass) : aConstructor;
  // console.log('TCL:: ~ file: newPrototype.js ~ line 13 ~ ctor', aClass, ctor);
  var result;
  if (Object.create) { //typeof Object.create === 'function'
    result = Object.create(aClass.prototype, {
      Class: {
        value: aConstructor,
        enumerable: false,
        writable: true,
        configurable: true
      },
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  } else {
    var Obj = function obj() {this.constructor = ctor;this.Class = aConstructor;};
    Obj.prototype = aClass.prototype;
    result = new Obj();
  }
  _clone(result, aConstructor.prototype, function(k,v){
    if (['Class', 'constructor'].includes(k)) return;
    return v;
  });
  return result;
};
