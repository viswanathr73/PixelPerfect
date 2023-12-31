const getPrototypeOf = require('./getPrototypeOf');
const gCache = new WeakMap();

/**
 * Returns a proxy object that provides access to the methods of the given instance's parent class.
 * The returned proxy object behaves like `super` keyword in that it allows accessing parent class instance methods.
 * @param {object} instance - The instance to get the parent class instance methods from.
 * @param {WeakMap|boolean=} cache - An optional WeakMap object to cache the proxy object for better performance. defaults to false
 * @returns {object} - A proxy object that provides access to the methods of the given instance's parent class.
 * @throws {TypeError} - If the given instance is not an object or is null.
 *
 * @example
 * class Animal {
 *   walk() {
 *     console.log('Animal walks');
 *   }
 * }
 *
 * class Rabbit extends Animal {
 *   walk() {
 *     console.log('Rabbit hops');
 *     // super.walk();
 *     getSuper(this).walk(); // call the parent's walk method.
 *   }
 * }
 *
 * const rabbit = new Rabbit();
 * const superRabbit = getSuper(rabbit);
 * superRabbit.walk(); // logs 'Animal walks'
 */
module.exports = function getSuper(instance, cache) {
  if (typeof instance !== 'object' || instance === null) {
    throw new TypeError('getSuper() can only be used with instances of an object');
  }
  if (cache === true) cache = gCache
  let proxy = cache && cache.get(instance);
  if (!proxy) {
    const proto = getPrototypeOf(getPrototypeOf(instance));
    proxy = new Proxy(instance, {
      get(target, prop) {
        // let v = typeof proto[prop] === 'function' ? proto[prop] : target[prop];
        return proto[prop];
      },
      getPrototypeOf() {return proto},
      // disable write access
      set() {}
    });
    if (cache) cache.set(instance, proxy);
  }
  return proxy;
}
