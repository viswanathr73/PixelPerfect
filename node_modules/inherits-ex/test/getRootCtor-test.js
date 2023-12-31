var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

var expect = chai.expect;

should = chai.should();

chai.use(sinonChai);

var getRootCtor= require('../src/getRootCtor');

describe("getRootCtor", function() {
  class Creature {}
  class Animal extends Creature {}
  class Bird extends Creature {}
  class Rabbit extends Animal {}

  it("should getRootCtor correctly", function() {
    expect(getRootCtor(Rabbit)).to.equal(Creature)
    expect(getRootCtor(Bird)).to.equal(Creature)
    expect(getRootCtor(Object)).to.equal(Object)
  });
  it("should getRootCtor with specified rootCtor correctly", function() {
    expect(getRootCtor(Rabbit, Creature)).to.equal(Animal)
  });
});

