var hasOwnProperty      = Object.prototype.hasOwnProperty;

/**
 * Returns the value of an own property of an object.
 *
 * @param {Object} obj - The object to get the property value from.
 * @param {string} prop - The name of the property to get the value of.
 * @returns {*} - The value of the property if it exists, undefined otherwise.
 */
module.exports = function getOwnPropValue(obj, prop) {
  if (obj && hasOwnProperty.call(obj, prop)) {
    return obj[prop];
  }
}
