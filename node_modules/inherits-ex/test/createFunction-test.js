var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
chai.use(sinonChai);

var createFunction = require('../src/createFunction');

function checkFunc(fn, name, argNames, result, args) {
  var argLen = (argNames && argNames.length) || 0;
  expect(fn).to.be.exist;
  expect(fn).to.have.property('name', name);
  expect(fn).to.have.length(argLen);
  if (args === undefined) args = []
  else if (!Array.isArray(args)) args = [args];
  expect(fn.apply(undefined, args)).to.equal(result);
}

describe("createFunction", function() {
  it("should create an empty named function", function() {
    var fn;
    fn = createFunction("myFn");
    checkFunc(fn, 'myFn')
  });

  it("should create an empty named function with args", function() {
    var fn;
    fn = createFunction("myFn", ['arg1', 'arg2']);
    checkFunc(fn, 'myFn', ['arg1', 'arg2'])
  });
  it("should create a function", function() {
    var fn;
    fn = createFunction("myFn", ['arg1', 'arg2'], "return arg1+arg2");
    checkFunc(fn, 'myFn', ['arg1', 'arg2'], 12, [4, 8]);
  });
  it("should create a function without args", function() {
    var fn;
    fn = createFunction("myFn", "return 'hello!'");
    checkFunc(fn, 'myFn', null, 'hello!');
  });
  it("should create a function with specified scope", function() {
    var b, fn;
    b = 123;
    fn = createFunction("myFn", ['arg1', 'arg2'], "return arg1+arg2+b", {
      b: b
    });
    checkFunc(fn, 'myFn', ['arg1', 'arg2'], 135, [10,2]);
  });
  it("should create a function with given scope and values array", function() {
    var b, fn;
    b = 123;
    fn = createFunction("myFn", ['arg1', 'arg2'], "return arg1+arg2+b", ['b'], [b]);
    checkFunc(fn, 'myFn', ['arg1', 'arg2'], 135, [10,2]);
  });
  it('should create a function with the given body', () => {
    var body = 'console.log("test");';
    var fn = createFunction('testFunction', [], body);
    checkFunc(fn, 'testFunction');
    expect(fn.toString().match(/\{([\s\S]*)\}/)[1].trim()).to.equal(body)
  });
});
