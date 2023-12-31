/**
 * Check if an object is empty.
 * @param {Object} obj - The object to be checked.
 * @returns {boolean} - Whether the object is empty or not.
 */
module.exports = function isEmptyObject(obj) {
    var k;
    for (k in obj) {
        return false;
    }
    return true;
}
