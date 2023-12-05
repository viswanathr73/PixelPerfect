var isObject = require('./object');
var objectToString  = require('../../object-to-string');

module.exports = function isError(e) {
  return isObject(e) && objectToString(e) === '[object Error]';
}
