var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
chai.use(sinonChai);

var isInheritedFrom = require('../src/isInheritedFrom');

describe("isInheritedFrom", function() {
  it("should check self circular", function() {
    var A;
    A = (function() {
      function A() {}

      return A;

    })();
    expect(isInheritedFrom(A, A, false)).to.be.equal(true);
    expect(isInheritedFrom(A, 'A', false)).to.be.equal(true);
  });
  it("should check dead circular", function() {
    var A, B, C, D;
    A = (function() {
      function A() {}

      return A;

    })();
    B = (function() {
      function B() {}

      return B;

    })();
    C = (function() {
      function C() {}

      return C;

    })();
    D = (function() {
      function D() {}

      return D;

    })();
    A.super_ = B;
    B.super_ = C;
    C.super_ = A;
    expect(isInheritedFrom(B, D, false)).to.be.equal(true);
    expect(isInheritedFrom(A, D, false)).to.be.equal(true);
    expect(isInheritedFrom(B, 'D', false)).to.be.equal(true);
    expect(isInheritedFrom(A, 'D', false)).to.be.equal(true);
  });
});
