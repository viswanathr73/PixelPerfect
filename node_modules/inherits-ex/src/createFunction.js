//Write by http://stackoverflow.com/users/1048572/bergi
/*
 * Usage:
 *   var fn = createFunction('yourFuncName', ['arg1', 'arg2'], 'return log(arg1+arg2);', {log:console.log});
 *
 * fn.toString() is :
 * "function yourFuncName(arg1, arg2) {
 *    return log(arg1+arg2);
 *  }"
 * here use a tricky to apply the scope:
 * Function(aArguments, aBody)
 * Function(scopeNames, aFunctionCloureBody).apply(null, scopeValues)
 */
var isArray = Array.isArray;
var isString = function(v){return typeof v === 'string';};
var isObject = function(v){return v && typeof v === 'object';};

/**
 * Creates a new function with the given name, arguments, body, scope, and values.
 * 
 * @param {string} name - The name of the function.
 * @param {string|string[]} args - The argument names of the function if it's `string[]`, else it's the function body without arguments.
 * @param {string} body - The body of the function.
 * @param {string[]|Object=} scope - The scope of the function.
 * @param {Array=} values - The values of the `scope` if the `scope` is `string[]``.
 * @returns {Function} - The created function.
 * 
 * @example
 *   var fn = createFunction('yourFuncName', ['arg1', 'arg2'], 'return log(arg1+arg2);', {log:console.log.bind(console)});
 */
function createFunction(name, args, body, scope, values) {
  if (arguments.length === 1) return Function('function ' + name + '(){}\nreturn ' + name + ';')();
  if (isString(args)) {
    values = scope;
    scope = body;
    body = args;
    args = [];
  } else if (args == null) {
    args = [];
  }
  if (!isArray(scope) || !isArray(values)) {
    if (isObject(scope)) {
      var keys = Object.keys(scope);
      values = keys.map(function(k) { return scope[k]; });
      scope = keys;
    } else {
      values = [];
      scope = [];
    }
  }
  if (typeof body !== 'string') body = ''
  return Function(scope,
    'function ' + name + '(' + args.join(', ') + ') {\n' + body + '\n}\nreturn ' + name + ';').apply(null, values);
};

module.exports = createFunction
