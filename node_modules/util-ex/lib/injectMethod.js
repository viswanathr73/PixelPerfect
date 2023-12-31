
/**
 * Injects method into an object. optionally preserving access to the original method via "`super`" and original instance via "`self`".
 *
 * **Note**:
 *
 * * In the new method, you can use `this.super()` to call the original method, `this.super()` is already bound with original instance.
 * * The `this[aMethodName]` is also the original method, but not bound yet.
 * * `this.self` is the original instance!
 *
 * @param {object} aObject the target object to inject
 * @param {string} aMethodName the target method to inject
 * @param {Function} aNewMethod the new method to be injected into the aObject.
 * @returns {boolean} whether the injection is successful.
 *
 * @example
 * var obj = {
 *   method1: function() {
 *     console.log('Hello');
 *   }
 * };
 *
 * var newMethod = function() {
 *   this.super();
 *   console.log('World');
 * };
 *
 * injectMethod(obj, 'method1', newMethod);
 *
 * obj.method1(); // Output: Hello\nWorld
 */
function injectMethod(aObject, aMethodName, aNewMethod) {
  var result;
  var vOldMethod = aObject[aMethodName];
  if (result = vOldMethod === undefined) {
    aObject[aMethodName] = aNewMethod;
  } else if (result = typeof vOldMethod === 'function') {
    aObject[aMethodName] = (function(inherited, method) {
      return function() {
        var that = {
          super: function() {
            return inherited.apply(this.self, arguments);
          },
          self: this
        };
        that[aMethodName] = inherited;
        Object.setPrototypeOf(that, this);
        return method.apply(that, arguments);
      };
    })(vOldMethod, aNewMethod);
  }
  return result;
};

module.exports = injectMethod

/*
inheritMethod2 = function(aObject, aMethods) {
  var aScope, aValues, k, keys, results, v, vOrgMethod;
  if (!isArray(aScope) || !isArray(aValues)) {
    if (isObject(aScope)) {
      keys = Object.keys(aScope);
      aValues = keys.map(function(k) {
        return aScope[k];
      });
      aScope = keys;
    } else {
      aValues = [];
      aScope = [];
    }
  }
  aScope.push('inherited');
  if (aMethods instanceof Object) {
    results = [];
    for (k in aMethods) {
      v = aMethods[k];
      if (!isFunction(v)) {
        continue;
      }
      vOrgMethod = aObject[k];
      if (!isFunction(vOrgMethod)) {
        results.push(aObject[k] = v);
      } else {
        results.push(aObject[k] = (function(inherited) {
          var values;
          values = aValues.slice();
          values.push(inherited);
          return Function(aScope, "return " + v).apply(this, values);
        })(vOrgMethod));
      }
    }
    return results;
  }
};

*/

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

// ES6 Class: this can not work! because the super can not be used in function !!
function injectMethod(clazz, methodName, newMethod) {
  const tempClass = class extends clazz {};
  const oldMethod = clazz.prototype[methodName];
  tempClass.prototype[methodName] = newMethod;
  clazz.prototype[methodName] = function() {
    return tempClass.prototype[methodName].apply(this, arguments);
    // the problem is __proto__ is changed by the injectMethod!
    const oldPrototypOf = Object.getPrototypeOf(this);
    Object.setPrototypeOf(this, tempClass);
    const result = super[methodName](...arguments)
    Object.setPrototypeOf(this, oldPrototypOf);
    return result;
  }
}
 */
