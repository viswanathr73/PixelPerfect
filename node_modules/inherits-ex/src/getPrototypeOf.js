var getPrototypeOf = Object.getPrototypeOf;

if (!getPrototypeOf) {
  getPrototypeOf = function(obj) {
    return obj.__proto__;
  };
}

module.exports = getPrototypeOf;
