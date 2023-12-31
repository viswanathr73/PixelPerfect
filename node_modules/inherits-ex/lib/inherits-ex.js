var getClassByName = require('./get-class-by-name');
var inherits = require('./inherits');

function isFunction(value) {
  return typeof value === 'function';
};

function isString(value) {
  return typeof value === 'string';
};

function isObject(value) {
  return typeof value === 'object';
};

var isArray = Array.isArray;

/**
 * The enhanced dynamical `inherits` implementation.
 *
 * + load the class via dynamical name.
 * * requireClass *(Function)*:
 * * scope *(Object)*: collects the register classes.
 *   * the inherits ctor will be added into the scope automatically.
 *
 * The default requireClass is `getClassByName`.
 *
 * @param {Function=} aDefaultRequire custom the requireClass function.
 * @returns {Function} the `inherits` function
 *
 * @example
 *
 *   var InheritsEx = require('inherits-ex/lib/inherits-ex')
 *   var defaultRequire = InheritsEx.requireClass;
 *   // You should return the proper class(ctor) here.
 *   InheritsEx.requireClass = function(className, scope){return defaultRequire.apply(null, arguments)};
 *   var inherits = InheritsEx()
 *
 * const requireClass = (aClassName, aScope) => getClassViaName(aClassName)
 * const InheritsEx = require('inherits-ex/lib/inherits-ex')
 * const inherits   = InheritsEx(requireClass)
 *
 * class RootClass {}
 * class Parent {}
 * InheritsEx.setScope([RootClass, Parent])
 *
 * class MyClass3 {}
 * inherits(MyClass3, RootClass)
 *
 */
function InheritsEx(aDefaultRequire) {
  if (isFunction(aDefaultRequire)) {
    InheritsEx.requireClass = aDefaultRequire;
  }
  return InheritsEx.execute;
}

InheritsEx.requireClass = getClassByName;

InheritsEx.scope = {};

InheritsEx.setScope = function(aScope) {
  if (Array.isArray(aScope)) {
    for (var j = 0; j < aScope.length; j++) {
      var k = aScope[j];
      var vName = k.name;
      if (vName == null) {
        throw TypeError('No Scope Name for ' + k);
      }
      InheritsEx.addClass(vName, k)
    }
  } else if (isObject(aScope) || isFunction(aScope)) {
    InheritsEx.scope = aScope;
  }
};

/**
 * Get the class from class name in scope
 * @param {*} aClassName the class name to find
 * @param {Function|string[]|Function[]|{[name: string]: Function}=} aScope  The optional additional scope with all
 *   registered classes. It'll be called to find the class if the aScope is a `function(className):Function`.
 * @param {Function[]=} aValues If `aScope` is an array of strings, then `aValues` must exist and can only be an array of corresponding classes.
 * @returns {Function|undefined} the found class or undefined.
 */
InheritsEx.getClass = function(aClassName, aScope, aValues) {
  var requireClass, result;
  requireClass = InheritsEx.requireClass;
  if (aScope != null) {
    result = requireClass(aClassName, aScope, aValues);
  }
  if (!result && (aScope = InheritsEx.scope)) {
    result = requireClass(aClassName, aScope);
  }
  return result;
};

InheritsEx.execute = function(ctor, superCtors, aScope, aValues) {
  var isStrCtor;
  var getClass = InheritsEx.getClass;
  if (isStrCtor = isString(ctor)) {
    ctor = getClass(ctor, aScope, aValues);
  }
  if (isString(superCtors)) {
    superCtors = getClass(superCtors, aScope, aValues);
  } else if (isArray(superCtors)) {
    superCtors = (function() {
      var results = [];
      for (var j = 0; j < superCtors.length; j++) {
        var i = superCtors[j];
        if (isString(i)) {
          results.push(getClass(i, aScope, aValues));
        } else {
          results.push(i);
        }
      }
      return results;
    })();
  }
  var result = inherits(ctor, superCtors);
  if (result && !isStrCtor) {
    InheritsEx.addClass(ctor.name, ctor);
  }
  return result;
};

/**
 * Add the class to the scope
 *
 * @internal
 * @param {string} aName the class name
 * @param {*} ctor  the class
 */
InheritsEx.addClass = function(aName, ctor) {
  var scope;
  scope = InheritsEx.scope;
  switch (typeof scope) {
    case 'function':
      scope(aName, ctor);
      break;
    case 'object':
      scope[aName] = ctor;
      break;
  }
};

module.exports = InheritsEx;
