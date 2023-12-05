var chai            = require('chai')
var sinon           = require('sinon')
var sinonChai       = require('sinon-chai')
var expect          = chai.expect

var defineProperty  = require('../src/defineProperty')

var log             = console.log.bind(console)

chai.use(sinonChai)

describe('defineProperty', () => {
  it('should define property with key,value argument', () => {
    var obj = {}
    expect(defineProperty(obj, 'foo', 'bar')).equal(obj)
    expect(obj).have.ownProperty( 'foo' , 'bar')
    var propDesc = Object.getOwnPropertyDescriptor(obj, 'foo');
    expect(propDesc).to.have.property('writable', true)
    expect(propDesc).to.have.property('enumerable', false)
  })

  it('should define property with key, undefined, options argument', () => {
    var obj = {}
    defineProperty(obj, 'foo', undefined, {value: 'bar'})
    expect(obj).have.ownProperty( 'foo' , 'bar')
    var propDesc = Object.getOwnPropertyDescriptor(obj, 'foo');
    expect(propDesc).to.have.property('writable', true)
    expect(propDesc).to.have.property('enumerable', false)
  })

  it('should define property with key,value, options argument', () => {
    var obj = {}
    defineProperty(obj, 'foo', 'bar', {value: 'xxx', writable: false, enumerable: true})
    expect(obj).have.ownProperty( 'foo' , 'bar')
    var propDesc = Object.getOwnPropertyDescriptor(obj, 'foo');
    expect(propDesc).to.have.property('writable', false)
    expect(propDesc).to.have.property('enumerable', true)
  })

  it('should define property with key, undefined, get argument', () => {
    var obj = {}
    var getter = sinon.spy(() => 'bar')
    defineProperty(obj, 'foo', undefined, {get: getter, writable: false})
    expect(obj).have.ownProperty( 'foo' , 'bar')
    var propDesc = Object.getOwnPropertyDescriptor(obj, 'foo');
    expect(propDesc).not.to.have.property('writable')
    expect(propDesc).to.have.property('enumerable', false)
    expect(propDesc).to.have.property('get', getter)
  })

  it('should define property with key, undefined, get/set argument', () => {
    var obj = {}
    var getter = sinon.spy(() => 'bar')
    var setter = sinon.spy()
    defineProperty(obj, 'foo', undefined, {get: getter, set: setter, writable: false})
    expect(obj).have.ownProperty( 'foo' , 'bar')
    var propDesc = Object.getOwnPropertyDescriptor(obj, 'foo');
    expect(propDesc).not.to.have.property('writable')
    expect(propDesc).to.have.property('enumerable', false)
    expect(propDesc).to.have.property('get', getter)
    expect(propDesc).to.have.property('set', setter)
    obj.foo = 1
    expect(setter.callCount).equal(1)
  })
});
