/**
 *   Check if a value is a Buffer object.
 *   @param {*} arg - The value to check.
 *   @returns {boolean} - Returns `true` if `arg` is a Buffer object, else `false`.
 */
module.exports = Buffer && typeof Buffer.isBuffer === 'function' ? Buffer.isBuffer : function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.binarySlice === 'function'
  ;
}

