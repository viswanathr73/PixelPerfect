var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

chai.use(sinonChai);

var inject = require('../src/inject');

describe("inject", function() {

  it("should inject function and modifying arguments with beforeExec, afterExec", function() {
    var orgExec = sinon.spy(()=>222);
    var newArgs = inject.createArguments(['hi', 1])
    var beforeExec = sinon.spy(function () {
      return newArgs
    });
    var afterExec =  sinon.spy();
    var newExec = inject(orgExec, beforeExec, afterExec);

    expect(newExec(1, 2)).to.be.equal(222);
    beforeExec.should.have.been.calledOnce;
    beforeExec.should.have.been.calledWith(1, 2);
    orgExec.should.have.been.calledOnce;
    orgExec.should.have.been.calledWith('hi', 1);
    afterExec.should.have.been.calledOnce;
    afterExec.should.have.been.calledWith('hi', 1, 222, false);
  });

});
