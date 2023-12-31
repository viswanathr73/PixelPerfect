var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
chai.use(sinonChai);

var replaceCtor = require('../src/replaceCtor');

describe("replaceCtor", function() {
  return it("should replace an object's constructor", function() {
    var A, B, result;
    A = (function() {
      function A() {}

      return A;

    })();
    B = (function() {
      function B() {}

      return B;

    })();
    result = new A;
    replaceCtor(result, B);
    expect(result).to.have.property('Class', B);
    expect(result).to.be.instanceOf(B);
  });
});
