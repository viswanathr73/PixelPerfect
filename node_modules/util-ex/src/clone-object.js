var isFunction = require('./is/type/function');
var extend = require('./_extend');
var clonePropertiesTo = require('./clone-properties-to');
var createObject = require('inherits-ex/lib/createObject');
var getPrototypeOf = require('inherits-ex/lib/getPrototypeOf');

/**
 * Clones an object.
 *
 * @param {Object} aObject - The object to be cloned.
 * @param {boolean|function} [tryCloneFn=true] - A boolean indicating whether or not to try to clone the object using a '`clone`' function, or a function that can be used to clone the object. If set to `false`, the object will not be cloned using the '`clone`' function, even if it exists.
 * @returns {Object} The cloned object.
 *
 * @example
* // Clone a simple object.
* var myObject = { foo: 'bar' };
* var clonedObject = cloneObject(myObject);
*
* @example
* // Clone an object using a custom clone function.
* var myObject = { foo: 'bar', clone: function() { return { foo: this.foo }; } };
* var clonedObject = cloneObject(myObject);
*
* @example
* // Clone an object without trying to use a custom clone function.
* var myObject = { foo: 'bar', clone: function() { return { foo: this.foo }; } };
* var clonedObject = cloneObject(myObject, false);
*/
function cloneObject(aObject, tryCloneFn) {
  var ctor, proto, result;
  if (tryCloneFn !== false && isFunction(aObject.clone)) {
    result = aObject.clone();
  } else {
    proto = getPrototypeOf(aObject);
    ctor = proto.hasOwnProperty('Class') ? proto.Class : aObject.constructor;
    result = createObject(ctor);
    clonePropertiesTo(result, aObject);
  }
  return result;
};

module.exports = cloneObject
