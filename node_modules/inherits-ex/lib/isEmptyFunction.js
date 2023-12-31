var isEmptyCtor = require('./isEmptyCtor');

/**
 * Checks whether a given function is empty or not.
 * @param {Function} aFunc - The function to be checked.
 * @param {boolean} istanbul - whether has istanbul TODO: remove this!
 * @returns {boolean} - True if the function is empty, false otherwise.
 */
module.exports = function isEmptyFunction(aFunc, istanbul) {
  var vStr = aFunc.toString();
  var result = /^function\s*\S*\s*\((.|[\n\r\u2028\u2029])*\)\s*{[\s;]*}$/g.test(vStr);
  if (!result) {result = isEmptyCtor(vStr)}

  if (!result) {
    if (!istanbul) try {istanbul = eval("require('istanbul')");} catch(e){}
    if (istanbul)
      result = /^function\s*\S*\s*\((.|[\n\r\u2028\u2029])*\)\s*{__cov_[\d\w_]+\.f\[.*\]\+\+;}$/.test(vStr);
  }
  return result;
};
