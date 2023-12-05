var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

var expect = chai.expect;

should = chai.should();

chai.use(sinonChai);

var getPrototypeOf = require('../src/getPrototypeOf');

describe("getPrototypeOf", function() {
  return it("should get PrototypeOf object", function() {
    var Abc, obj, result;
    Abc = (function() {
      function Abc() {}

      return Abc;

    })();
    obj = new Abc;
    result = getPrototypeOf(obj);
    expect(result).to.exist;
    expect(result).to.be.equal(Abc.prototype);
  });
});
