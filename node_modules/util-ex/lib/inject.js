// var inherits = require('inherits-ex/lib/inheritsDirectly');
var defineProperty = require('inherits-ex/lib/defineProperty');
var isOldArguments = require('./is/type/arguments');
var arraySlice = Array.prototype.slice;

    /*
    @desc  inject the function
    @param aOrgFunc     the original function to be injected.
    @param aBeforeExec  this is called before the execution of the aOrgFunc.
                        you must return the arguments(new Arguments(arguments))
                        if you wanna modify the arguments value of the aOrgFunc.
                        it will stop the execution of the aOrgFunc if you return
                        a value not an Arguments object nor a undefined value
    @param aAfterExec   this is called after the execution of the aOrgFunc.
                        you must add a result argument at the last argument of the
                        aAfterExec function if you wanna get the result value of the aOrgFunc.
                        you must add a isDenied argument following the result argument if you
                        wanna know whether the aOrgFunc is executed.
                        you must return the result if you wanna modify the result value of the aOrgFunc .

    @Usage  Obj.prototype.Method = inject(Obj.prototype.Method, aFunctionBeforeExec[, aFunctionAfterExec]);
    @version 1.1
    @author  Aimingoo&Riceball
    @history
      V1.0 -- first released.
      V1.1 --
        Supports to deny the aOrgFunc execution in aBeforeExec.
        Supports around in the aAfterExec, the aAfterExec be always executed even though
        deny the aOrgFunc execution in aBeforeExec.
          + isDenied argument to the aAfterExec function. notice the aAfterExec whether
            the aOrgFunc is executed
      V1.2 -- Support catch the error in the original function.

    eg:
    var doTest = function (a) {return a};
    function beforeTest(a) {
      alert('before exec: a='+a);
      a += 3;
      return arguments;
    };
    function afterTest(a, result, isDenied) {
      alert('after exec: a='+a+';result='+result+';isDenied='+isDenied);
      return result+5;
    };

    doTest = inject(doTest, beforeTest, afterTest);

    alert (doTest(2));
    the result should be 10.

  */

/**
 * Wraps a function and executes code before and/or after the wrapped function.
 * @param {Function} aOrgFunc - The function to be wrapped.
 * @param {Function} aBeforeExec - A function to be executed before the wrapped function `aOrgFunc`.
 * @param {Function} aAfterExec - A function to be executed after the wrapped function `aOrgFunc`.
 * @throws {Error} If aAfterExec is not a function and an error occurs while executing the wrapped function.
 * @returns {Function} A new function that wraps the original function.
 *
 * BeforeExec:
 * If `aBeforeExec` is a function, it will be called with the same context and arguments as the wrapped function.
 * - If it returns an `Arguments` object, the wrapped function will be called with the modified arguments.
 * - If it returns a value other than `undefined`, the wrapped function will not be called and this value will be returned as result instead.
 *
 * AfterExec:
 * If `aAfterExec` is a function, it will be called with the same context, arguments with additional the result of the `aOrgFunc` and isDenied flag.
 * - If the `aOrgFunc` throws an error, the `result` parameter will be an `Error` object.
 * - If `aAfterExec` returns a value, it will be used as the final result of the wrapped function.
 * - If `isDenied` parameter is true, it means `aOrgFunc` was not called during execution of the wrapped function.
 *
 * @example
 * ```js
 * // Wrapping a function with injectFunc
 * const originalFunc = (a, b) => a + b;
 * const beforeFunc = (a, b) => console.log(`Before execution: a = ${a}, b = ${b}`);
 * const afterFunc = (result) => console.log(`After execution: result = ${result}`);
 * const wrappedFunc = injectFunc(originalFunc, beforeFunc, afterFunc);
 * const result = wrappedFunc(1, 2); // Logs "Before execution: a = 1, b = 2" and "After execution: result = 3"
 * ```
 *
 * @example
 * ```js
 * // Wrapping a function with injectFunc and modifying arguments and return value
 * const Arguments = injectFunc.Arguments
 * const originalFunc = (a, b) => a + b;
 * const beforeFunc = (a, b) => {
 *   console.log(`Before execution: a = ${a}, b = ${b}`);
 *   return new Arguments([a * 2, b * 3]);
 * };
 * const afterFunc = (result, isDenied) => {
 *   console.log(`After execution: result = ${result}, isDenied = ${isDenied}`);
 *   return result * 2;
 * };
 * const wrappedFunc = injectFunc(originalFunc, beforeFunc, afterFunc);
 * const result = wrappedFunc(1, 2); // Logs "Before execution: a = 1, b = 2", "After execution: result = 6, isDenied = false"
 * console.log(result); // Output: 12
 * ```
 *
 * @example
 * ```js
 * // Wrapping a function with injectFunc and not executing the original function
 * const originalFunc = (a, b) => a + b;
 * const beforeFunc = (a, b) => {
 *   console.log(`Before execution: a = ${a}, b = ${b}`);
 *   return "Not executing original function";
 * };
 * const afterFunc = (result, isDenied) => {
 *   console.log(`After execution: result = ${result}, isDenied = ${isDenied}`);
 *   return "Modified return value";
 * };
 * const wrappedFunc = injectFunc(originalFunc, beforeFunc, afterFunc);
 * const result = wrappedFunc(1, 2); // Logs "Before execution: a = 1, b = 2", "After execution: result = Modified return value, isDenied = true"
 * console.log(result); // Output: "Modified return value"
 * ```
 * @example
 * ```js
 * // Wrapping a function with injectFunc and getting the original function's error
 * const originalFunc = () => {
 *   throw new Error("Original function error");
 * };
 * const beforeFunc = () => {
 *   console.log("Before execution");
 * };
 * const afterFunc = (result, isDenied) => {
 *   console.log(`After execution: result = ${result}, isDenied = ${isDenied}`);
 * };
 * const wrappedFunc = injectFunc(originalFunc, beforeFunc, afterFunc);
 * wrappedFunc(); // Logs "Before execution", "After execution: result = [Error: Original function error], isDenied = false"
 * ```
 *
 */
function injectFunc( aOrgFunc, aBeforeExec, aAfterExec ) {
  return function() {
    var Result, isDenied=false, args=arraySlice.call(arguments);
    if (typeof(aBeforeExec) === 'function') {
      //the result
      //  * a return value instead of original function.
      //  * an arguments pass to original function.
      //  * whether deny the original function.
      //    * return the arguments to allow execution
      //    * return undefined to allow execution
      Result = aBeforeExec.apply(this, args);
      if (isArguments(Result)) {
        args = arraySlice.call(Result)
      } else if (isDenied = Result !== undefined) {
        args.push(Result)
      }
      Result = undefined
    }
    var err
    try {
      !isDenied && args.push(aOrgFunc.apply(this, args)); //if (!isDenied) args.push(aOrgFunc.apply(this, args));
    } catch (error) {
      err = error;
      args.push(error);
    }

    if (typeof(aAfterExec) === 'function') {
      Result = aAfterExec.apply(this, args.concat(isDenied));
    }
    else if (err) {
      throw(err);
    }
    if (Result === undefined) Result = args.pop();

    return Result;
  }
}

function createArguments(args) {
  if (arguments.length !== 1 || !Array.isArray(args)) args = arguments;
  var result = Array.apply(null, args);
  defineProperty(result, '__arguments__', true);
  return result;
}
injectFunc.createArguments = createArguments

function isArguments(v) {
  return (v && v.__arguments__) || isOldArguments(v);
}
injectFunc.isArguments = isArguments

module.exports = injectFunc
