/**
 * Inject method to an object.
 *
 * **Note**: The original method will be passed into the new method as first argument
 *
 * @param {object} aObject the target object to inject
 * @param {string} aMethodName the target method to inject
 * @param {Function} aNewMethod the new method to be injected into the aObject.
 * @param {boolean} bindThis optional whether the `Inherited` should bind `this` , defaults to `false`
 *
 * @example
 * class A {
 *   method() {console.log('A', arguments, this)}
 * }
 *
 * injectMethodEx(A.prototype, 'method', function(oldMethod, ...args) {
 *   console.log('B', args, this)
 *   oldMethod.apply(this, args)
 * })
 *
 * const a = new A
 * a.x = 1
 * a.method(12, 3)
 */
function injectMethodEx(aObject, aMethodName, aNewMethod) {
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

  return
  // can not use the aNewMethod directly!
  var vOldMethod  = aObject[aMethodName];
  var vMethodType = typeof vOldMethod;
  aObject[aMethodName] = (function(newMethod, oldMethod) {
    return function () {
      var args = [oldMethod].concat([].slice.apply(arguments))
      return newMethod.apply(this, args);
    }
  })(aNewMethod, vOldMethod)
  return

  if (result = (vOldMethod === undefined)) {
    aObject[aMethodName] = function() {
    aNewMethod;
    }
  } else if (result = vMethodType === 'function') {
    aObject[aMethodName] = (function(newMethod, oldMethod) {
      return function () {
        var args = [oldMethod].concat([].slice.apply(arguments))
        return newMethod.apply(this, args);
      }
    })(aNewMethod, vOldMethod)

    // perfect but can not support the function in closure
    // You can use `Inherited.call(this,...args)` to call the original method.
    // var fn = bindThis ? 'return function(){' +
    //       'Inherited=Inherited.bind(this);' +
    //       'return ('+ aNewMethod +').apply(this, arguments)}'
    //     : 'return ' + aNewMethod;
    // aObject[aMethodName] = Function(['Inherited'], fn).apply(this, [vOldMethod]);
  }
  return result;
};

module.exports = injectMethodEx
