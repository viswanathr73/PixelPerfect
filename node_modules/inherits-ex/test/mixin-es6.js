var chai            = require('chai')
var sinon           = require('sinon')
var sinonChai       = require('sinon-chai')
var assert          = chai.assert
var expect          = chai.expect
var should          = chai.should()

var inherits        = require('../src/inherits')
var inheritsDirectly= require('../src/inheritsDirectly')
var inheritsObject  = require('../src/inheritsObject')
var mixin           = require('../src/mixin')
var isInheritedFrom = require('../src/isInheritedFrom')
var isMixinedFrom   = require('../src/isMixinedFrom')
var createObject    = require('../src/createObject')
var createObjectWith= require('../src/createObjectWith')
var getProtoChain   = require('../src/getProtoChain')

log             = console.log.bind(console)
chai.use(sinonChai)

describe("mixin es6", function(){
  it("test mixin with super", function(){
    let mCallOrder = [];
    class A {
      m(){
        mCallOrder.push('A')
      }
    }
    class A1 extends A{
      mo() {
        mCallOrder.push('A1mo')
      }
      m1(){
        mCallOrder.push('A1m1');
        super.m();
      }
      m(){
        mCallOrder.push('A1');
        super.m();
      }
    }
    A1.prototype.prop1 = 2;
    class B {
      m(){
        mCallOrder.push('B');
      }
    }
    class B1 {
      m(){
        mCallOrder.push('B1');
        super.m();
      }
    }
    inherits(B1, B)

    mixin(B1, A1).should.be.equal(true, 'mixin');
    // log(getProtoChain(B1))
    o = new B1()
    expect(o.prop1).to.be.equal(2)
    // o.should.have.property('prop1', 2)
    o.m("a", 12) // call chain:  B1::m -> A1::m -> A::m
    mCallOrder.should.be.deep.equal(['B1', 'A1', 'A'])
    mCallOrder = []
    o.mo()
    mCallOrder.should.be.deep.equal(['A1mo'])
    mCallOrder = []
    o.m1()
    mCallOrder.should.be.deep.equal(['A1m1', 'A'])
    mCallOrder = []
  })
  it("test mixin static with super", function(){
    let mCallOrder = [];
    class A {
      static sm() {
        mCallOrder.push('Asm')
      }
    }
    class A1 extends A{
      static sm() {
        mCallOrder.push('A1sm')
        super.sm()
      }
    }
    class B1 {
    }

    mixin(B1, A1).should.be.equal(true, 'mixin');
    B1.sm()
    mCallOrder.should.be.deep.equal(['A1sm', 'Asm'])
  })
})
