var chai = require('chai');
var sinon = require('sinon');
sinonChai = require('sinon-chai');
assert = chai.assert;
should = chai.should();
chai.use(sinonChai);

var extend = require('../src/inheritsDirectly');
var getCtorOfProperty = require('../src/getCtorOfProperty');

describe("getCtorOfProperty", function() {
  it("should get the constructor which owned the property", function() {
    var A, B, C, result;
    A = (function() {
      function A() {}

      A.prototype.a = 1;

      return A;

    })();
    B = (function(superClass) {
      extend(B, superClass);

      function B() {
        return B.__super__.constructor.apply(this, arguments);
      }

      B.prototype.b = 2;

      return B;

    })(A);
    C = (function(superClass) {
      extend(C, superClass);

      function C() {
        return C.__super__.constructor.apply(this, arguments);
      }

      C.prototype.c = 3;

      return C;

    })(B);
    result = getCtorOfProperty(C, 'c');
    result.should.be.equal(C);
    result = getCtorOfProperty(C, 'b');
    result.should.be.equal(B);
    result = getCtorOfProperty(C, 'a');
    result.should.be.equal(A);
    result = getCtorOfProperty(C, 'no');
    should.not.exist(result);
  });
});
