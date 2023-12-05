var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

var expect = chai.expect;

chai.use(sinonChai);

var InheritsEx = require('../src/inherits-ex');
var isInheritedFrom = require('../src/isInheritedFrom');

describe("inheritsEx", function() {
  var inherits;
  inherits = InheritsEx.execute;
  it("should inherits from string", function() {
    var A, B;
    A = (function() {
      function A() {}

      return A;

    })();
    B = (function() {
      function B() {}

      return B;

    })();
    expect(inherits('A', 'B', [A, B])).to.be["true"];
    expect(isInheritedFrom(A, B, false)).to.be.equal(A);
    expect(isInheritedFrom(B, 'A', false)).to.be.equal(false);
  });
  it("should inherits from array", function() {
    var A, B, Root;
    A = (function() {
      function A() {}

      return A;

    })();
    B = (function() {
      function B() {}

      return B;

    })();
    Root = (function() {
      function Root() {}

      return Root;

    })();
    expect(inherits('A', ['B', 'Root'], [A, B, Root])).to.be["true"];
    expect(isInheritedFrom(A, B, false)).to.be.equal(A);
    expect(isInheritedFrom(A, Root, false)).to.be.equal(B);
    expect(isInheritedFrom(B, 'A', false)).to.be.equal(false);
  });
  it("should inherits with scope array", function() {
    var A, B, Root;
    A = (function() {
      function A() {}

      return A;

    })();
    B = (function() {
      function B() {}

      return B;

    })();
    Root = (function() {
      function Root() {}

      return Root;

    })();
    InheritsEx.setScope([A, B, Root]);
    try {
      expect(inherits('A', ['B', 'Root'])).to.be["true"];
      expect(isInheritedFrom(A, B, false)).to.be.equal(A);
      expect(isInheritedFrom(A, Root, false)).to.be.equal(B);
      expect(isInheritedFrom(B, 'A', false)).to.be.equal(false);
    } finally {
      InheritsEx.scope = {};
    }
  });
  return it("should inherits with scope object", function() {
    var A, B, Root;
    A = (function() {
      function A() {}

      return A;

    })();
    B = (function() {
      function B() {}

      return B;

    })();
    Root = (function() {
      function Root() {}

      return Root;

    })();
    InheritsEx.setScope({
      B: B,
      Root: Root
    });
    try {
      expect(inherits(A, ['B', 'Root'])).to.be["true"];
      expect(isInheritedFrom(A, B, false)).to.be.equal(A);
      expect(isInheritedFrom(A, Root, false)).to.be.equal(B);
      expect(isInheritedFrom(B, 'A', false)).to.be.equal(false);
      expect(InheritsEx.scope).to.has.property('A', A);
    } finally {
      InheritsEx.scope = {};
    }
  });
});
