var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

chai.use(sinonChai);

var injectMethod = require('../src/injectMethodEx');

describe("injectMethodEx", function() {

  it("should inject method to an object", function() {
    var orgExec = sinon.spy(function() {
      this.should.be.equal(t);
    });
    var orgRun = sinon.spy(function() {
      this.should.be.equal(t);
    });

    class Test {};

    Test.prototype.exec = orgExec;

    Test.prototype.run = orgRun;

    var newExec = sinon.spy(function(Inherited, a, b) {
      Inherited.call(this, "hi", 1);
      return this.should.be.equal(t);
    });

    var newRun = sinon.spy(function(Inherited, a, b) {
      Inherited.call(this, "my", 2);
      return this.should.be.equal(t);
    });
    injectMethod(Test.prototype, 'exec', newExec).should.be.true;
    var t = new Test();
    t.exec(1, 2);
    orgExec.should.have.been.calledOnce;
    orgExec.should.have.been.calledWith('hi', 1);
    newExec.should.have.been.calledOnce;
    newExec.should.have.been.calledWith(orgExec, 1, 2);
  });

  it("should inject new method to an object", function() {
    class Test {};
    var newExec = sinon.spy(function(Inherited, a, b) {
      should.not.exist(Inherited);
      return this.should.be.equal(t);
    });
    var newRun = sinon.spy(function(Inherited, a, b) {
      should.not.exist(Inherited);
      return this.should.be.equal(t);
    });
    injectMethod(Test.prototype, 'exec', newExec).should.be.true;
    Test.prototype.exec.should.be.equal(newExec);
    var t = new Test();
    t.exec(1, 2);
    newExec.should.have.been.calledOnce;
    newExec.should.have.been.calledWith(undefined, 1, 2);
  });

  it("should inject (class) method to an object", function() {
    var orgExec = sinon.spy();
    var orgRun = sinon.spy();
    class Test {};

    Test.exec = orgExec;

    Test.run = orgRun;

    var newExec = sinon.spy(function(Inherited, a, b) {
      return Inherited.call(this, "hi", 1);
    });
    var newRun = sinon.spy(function(Inherited, a, b) {
      return Inherited.call(this, "my", 2);
    });
    injectMethod(Test, 'exec', newExec).should.be.true;
    Test.exec(1, 2);
    orgExec.should.have.been.calledOnce;
    orgExec.should.have.been.calledWith('hi', 1);
    newExec.should.have.been.calledOnce;
    newExec.should.have.been.calledWith(orgExec, 1, 2);
  });
  it("should not inject method to a non-function attribute of an object", function() {
    class Test {};

    Test.prototype.exec = 123;


    var newExec = sinon.spy(function(Inherited, a, b) {
      should.not.exist(Inherited);
      return this.should.be.equal(t);
    });
    injectMethod(Test.prototype, 'exec', newExec).should.be.false;
    Test.prototype.exec.should.be.equal(123);
  });
});
