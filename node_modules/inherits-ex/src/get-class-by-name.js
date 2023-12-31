var isArray = Array.isArray;

function getClass(aClassName, aScope, aValues) {
  var vKeys;
  if (typeof aScope === 'function') {
    return aScope(aClassName)
  } else if (isArray(aScope)) {
    if (!isArray(aValues)) {
      aValues = aScope;
      aScope = aValues.map(function(k) {
        var result;
        result = k.name;
        if (result == null) {
          throw TypeError('No Scope Name for ' + k);
        }
        return result;
      });
    }
  } else if (typeof aScope === 'object') {
    vKeys = Object.keys(aScope);
    aValues = vKeys.map(function(k) {
      return aScope[k];
    });
    aScope = vKeys;
  } else {
    return
  };
  var ix = aScope.indexOf(aClassName);
  return aValues[ix];
  // return Function(aScope, 'return ' + aClassName).apply(null, aValues);
};

/**
 * Retrieve a class from the registered classes in the scope by its name.
 *
 * @param {string|Function} aClassName The class name or class. if it's class return it directly.
 * @param {Function|string[]|Function[]|{[name: string]: Function}=} aScope  The scope with all registered classes.
 *     it'll be called to find the class if the aScope is a `function(className):Function`
 * @param {Function[]=} aValues If `aScope` is an array of strings, then `aValues` must exist and can only be an array of corresponding classes.
 * @returns {Function|undefined} return the found class or undefined
 */
module.exports = function getClassByName(aClassName, aScope, aValues) {
  var result;
  if (aClassName != null) {
    if (typeof aClassName === 'function') {
      result = aClassName;
    } else if (typeof aClassName === 'string') {
      if (!/[, {}();.]+/.test(aClassName)) {
        result = getClass(aClassName, aScope, aValues);
      }
    }
  }
  return result;
};
