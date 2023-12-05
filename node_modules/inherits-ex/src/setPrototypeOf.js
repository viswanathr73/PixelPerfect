var setPrototypeOf = Object.setPrototypeOf;

if (!setPrototypeOf) {
  setPrototypeOf = function(obj, prototype) {
    obj.__proto__ = prototype;
    return obj;
  };
}

module.exports = setPrototypeOf;
