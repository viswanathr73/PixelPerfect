var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

var expect = chai.expect;

should = chai.should();

chai.use(sinonChai);

var getClosestCommonAncestorCtor = require('../src/getClosestCommonAncestorCtor');

describe("getClosestCommonAncestorCtor", function() {
  class Creature {}
  class Animal extends Creature {}
  class Bird extends Creature {}
  class Rabbit extends Animal {}
  class Cat extends Animal {}
  class Parrot extends Bird {}
  class Root {}

  it("should getClosestCommonAncestorCtor correctly", function() {
    expect(getClosestCommonAncestorCtor(Rabbit, Cat)).to.equal(Animal)
    expect(getClosestCommonAncestorCtor(Rabbit, Parrot)).to.equal(Creature)
    expect(getClosestCommonAncestorCtor(Bird, Creature)).to.equal(Creature)
    expect(getClosestCommonAncestorCtor(Bird, Root)).to.be.undefined
  });
});

