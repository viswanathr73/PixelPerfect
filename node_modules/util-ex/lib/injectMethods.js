/* injectMethods(object, methods)

inject methods to an object. You can use `this.super()` to call the original method.
and use `this.self` to get the original `this` object if the original method is exists.

* methods*(object)*:
  * key: the method name to inject
  * value: the new method function
 */

var isFunction = require('./is/type/function');
var injectMethod = require('./injectMethod');

/**
 * Injects multiple methods into an object, optionally preserving access to the original methods via "`super`" and original instance via "`self`".
 *
 * **Note**:
 *
 * * In the new replaced method, you can use `this.super()` to call the original method, `this.super()` is already bind with original instance.
 * * The `this[aMethodName]` is the original method, but not bind yet.
 * * `this.self` is the original instance!
 *
 * @param {object} aObject - The target object to inject methods into.
 * @param {object} aMethods - The methods to inject into the aObject.
 * @param {object=} [aOptions] - The optional parameters.
 * @param {{[name: string]:boolean}=} [aOptions.replacedMethods] - The methods that should be replaced in the aObject.
 * @returns {boolean} Whether the injections are successful.
 *
 * @example
 * var obj = {
 *   method1: function() {
 *     console.log('Hello');
 *   },
 *   method2: function() {
 *     console.log('World');
 *   }
 * };
 *
 * var newMethods = {
 *   method1: function() {
 *     this.super();
 *     console.log('New Hello');
 *   },
 *   method3: function() {
 *     console.log('New World');
 *   }
 * };
 *
 * injectMethods(obj, newMethods, { replacedMethods: { method2: true } });
 *
 * obj.method1(); // Output: Hello\nNew Hello
 * obj.method2(); // Output: World
 * obj.method3(); // Output: New World
 */
module.exports = function injectMethods(aObject, aMethods, aOptions) {
  var inherited, k, replacedMethods, results, v;
  if (aOptions && aOptions.replacedMethods) {
    replacedMethods = aOptions.replacedMethods;
  }
  if (aMethods instanceof Object) {
    results = [];
    for (k in aMethods) {
      v = aMethods[k];
      if (!isFunction(v)) {
        continue;
      }
      inherited = aObject[k];
      if (isFunction(inherited) && !(replacedMethods && replacedMethods[k])) {
        results.push(injectMethod(aObject, k, v));
      } else {
        results.push(aObject[k] = v);
      }
    }
    return results;
  }
};

/*
* scope*(object)*: the new function scope
module.exports = (aObject, aMethods) ->
  if not isArray(aScope) or not isArray(aValues)
    if isObject(aScope)
      keys = Object.keys(aScope)
      aValues = keys.map (k) -> aScope[k]
      aScope = keys
    else
      aValues = []
      aScope = []
  aScope.push 'inherited'
  if aMethods instanceof Object
    for k,v of aMethods
      continue if not isFunction v
      vOrgMethod = aObject[k]
      if not isFunction vOrgMethod
        aObject[k] = v
      else
        aObject[k] = ((inherited)->
          values = aValues.slice()
          values.push inherited
          Function(aScope, "return "+v).apply(@, values)
        )(vOrgMethod)
 */
