var createFunction = require('./createFunction');
var isString = function(v){return typeof v === 'string';};

/**
 * Creates a constructor function dynamically with the given name, arguments, and body.
 * If the arguments are a string, it is assumed to be the body and the arguments are set to an empty array.
 * If the body is null or undefined, a default body is created that calls the parent constructor.
 *
 * @param {string} name - The name of the constructor function.
 * @param {Array|string} args - The arguments of the constructor function.
 * @param {string|null|undefined} body - The body of the constructor function.
 * @returns {Function} - The constructor function.
 */
function createCtor(name, args, body) {
  if (isString(args)) {
    body = args;
    args = [];
  }
  var parentPrototype = '(' + name + '.__super__||Object.getPrototypeOf(' + name + ').prototype)';
  if (body == null) body = 'var p=' + parentPrototype + ';return p?p.constructor.apply(this, arguments):undefined;'
  return createFunction(name, args, body);
};

module.exports = createCtor