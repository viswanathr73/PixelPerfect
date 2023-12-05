chai            = require 'chai'
sinon           = require 'sinon'
sinonChai       = require 'sinon-chai'
assert          = chai.assert
expect          = chai.expect
should          = chai.should()

inherits        = require '../src/inherits'
inheritsDirectly= require '../src/inheritsDirectly'
inheritsObject  = require '../src/inheritsObject'
mixin           = require '../src/mixin'
isInheritedFrom = require '../src/isInheritedFrom'
isMixinedFrom   = require '../src/isMixinedFrom'
createObject    = require('../src/createObject')
createObjectWith= require('../src/createObjectWith')

log             = console.log.bind console

chai.use(sinonChai)


getProtoChain = (p)->
  result = while p
    if p is Object
      name = "Base"
    else
      name = p.name
    p = p.super_
    name
  result.reverse()

compareProtoChain = (o, list) ->
  p = getProtoChain(o)
  for n,i in p
    if n isnt list[i] then return false
  true

describe "inherits", ->

  aMethod = ->
    "aMethod"
  a1Method = ->
    "a1Method"

  class Root
    @test: 1
    constructor: (@inited="Root", @other)->"Root"
    rootMethod: ->

  class B
    constructor: (@inited="B")->"B"
    bMethod: ->

  class A
    aMethod: aMethod

  class A1
    constructor: (@inited="A1")->"A1"
    a1Method: a1Method

  it "test inherits with none static inheritance", ->
    class R
      @test: 1
      constructor: (@inited="R", @other)->"R"
      rootMethod: ->

    class R1
      constructor: (@inited="B")->"B"
      bMethod: ->

    assert.equal inherits(R1, R, false), true
    assert.isUndefined R1.test

  it "test inherits and isInheritedFrom", ->
    assert.equal inherits(A, Root), true
    assert.equal inherits(A, Root), false
    assert.equal inherits(B, Root), true
    assert.equal inherits(A1, A), true
    assert.equal A.test, 1
    assert.equal B.test, 1
    assert.equal A1.test, 1
    assert.ok Root.isPrototypeOf A1
    assert.equal A1.super_, A
    assert.notOk A1.propertyIsEnumerable('super_')
    assert.notOk A1.propertyIsEnumerable('__super__')
    assert.equal A1::a1Method, a1Method
    assert.equal A::aMethod, aMethod
    assert.equal A1::constructor, A1
    assert.equal inherits(A1, Root), false, "A1 can not inherit Root again"
    assert.equal A1.super_, A
    assert.equal A.super_, Root
    assert.equal Root.super_, undefined
    assert.equal isInheritedFrom(A, Root), A
    assert.equal isInheritedFrom(A1, Root), A
    assert.equal isInheritedFrom(A1, A), A1
    assert.equal isInheritedFrom(A1, B), false, "A1 is not inherited from B"
    assert.equal isInheritedFrom(A, B), false, "A is not inherited from B"
    o = new A()
    assert.equal o.rootMethod, Root::rootMethod
    o = new A1()
    assert.equal o.rootMethod, Root::rootMethod
    assert.deepEqual getProtoChain(A1), [ 'Root', 'A', 'A1' ]
  it "should not inheritances dead circular", ->
    class C1
    class C2
    class C3
    assert.equal inherits(C1, C2), true
    assert.equal inherits(C2, C3), true
    assert.equal inherits(C3, C1), false
  it "should multi-inheritances", ->
    class C
    class D
    class E
    class MyClass
    # MyClass -> C -> D -> E
    assert.equal inherits(MyClass, [C, D, E]), true
    assert.deepEqual getProtoChain(MyClass), ['E', 'D', 'C', 'MyClass']
  it "should multi-inheritances and void circular inherit", ->
    class C
    class MyClass
    assert.equal inherits(C, Root), true

    # MyClass -> B -> Root
    assert.equal inherits(MyClass, B), true

    # MyClass -> C -> B -> Root
    assert.equal inherits(MyClass, C), true
    assert.deepEqual getProtoChain(MyClass), [ 'Root', 'B', 'C', 'MyClass']
    assert.equal isInheritedFrom(MyClass, C), MyClass
    assert.equal isInheritedFrom(MyClass, B), C
    assert.equal isInheritedFrom(MyClass, 'C'), MyClass
    assert.equal isInheritedFrom(MyClass, 'B'), C
  it "test isInheritedFrom with class name", ->
    isInheritedFrom = isInheritedFrom
    assert.equal isInheritedFrom(A, 'Root'), A
    assert.equal isInheritedFrom(A1, 'Root'), A
    assert.equal isInheritedFrom(A1, 'A'), A1
    assert.equal isInheritedFrom(A1, 'B'), false, "A1 is not inherited from B"
    assert.equal isInheritedFrom(A, 'B'), false, "A is not inherited from B"

  it "test inheritsObject", ->
    cMethod = ->
      "cMethod"
    C = ->
      "C"

    C.name = "C"
    C::cMethod = cMethod
    b = new B()
    assert.equal inheritsObject(b, C), true
    bProto = b.__proto__
    assert.equal bProto.cMethod, cMethod
    assert.equal bProto.constructor, C
    assert.equal C.super_, B
    b1 = new B()
    assert.equal inheritsObject(b1, C), true
    bProto = b1.__proto__
    assert.equal bProto.cMethod, cMethod
    assert.equal bProto.constructor, C
    assert.equal bProto, C::
  it "test inheritsDirectly and isInheritedFrom", ->
    cMethod = ->"cMethod"
    R = ->"R"
    R.name = "R"
    C = ->"C"
    C.name = "C"
    C::cMethod = cMethod

    C1 = -> "C1"
    C1.name = "C1"
    C11 = -> "C11"
    C11.name = "C11"
    C2 = -> "C2"

    assert.ok inherits(C, R), "C inherits from R"
    assert.ok inherits(C1, C), "C1 inherits from C"
    assert.ok inherits(C11, C1), "C11 inherits from C1"
    assert.ok inherits(C2, C), "C2 inherits from C"
    # C11 > C1 > C
    baseClass = isInheritedFrom C11, C
    assert.equal baseClass, C1
    inheritsDirectly baseClass, C2
    # C11 > C1 > C2 > C
    assert.equal isInheritedFrom(C11, C2), C1, "C11 > C2"
    assert.equal isInheritedFrom(C11, C1), C11, "C11 > C1"
    assert.equal isInheritedFrom(C11, C), C2, "C11 > C"

  describe "createObject", ->

    it 'should create plain object', ->
      result = createObject Object
      result.should.be.instanceof Object
      Object.should.not.have.ownProperty 'Class'
    it 'should create Array object', ->
      result = createObject Array, 12,34
      result.should.be.instanceof Array
      result.should.be.deep.equal [12,34]
      Object.should.not.have.ownProperty 'Class'
    it 'should create RegExp object', ->
      result = createObject RegExp, '^as.*', 'i'
      result.should.be.instanceof RegExp
      result.source.should.be.equal '^as.*'
      result.ignoreCase.should.be.true
      Object.should.not.have.ownProperty 'Class'
    it 'should call the parent\'s constructor method if it no constructor', ->
      A12 = ->
      assert.equal inherits(A12, A1), true
      a = createObject(A12)
      assert.equal a.Class, A12
      assert.instanceOf a, A12
      assert.instanceOf a, A1
      assert.instanceOf a, A
      assert.instanceOf a, Root
      assert.equal a.inited, "A1"

    it 'should call the root\'s constructor method if its parent no constructor yet', ->
      A2 = ->
      assert.equal inherits(A2, A), true
      a = createObject(A2)
      assert.equal a.Class, A2
      assert.instanceOf a, A2
      assert.instanceOf a, A
      assert.instanceOf a, Root
      assert.equal a.inited, "Root"
    it 'should pass the correct arguments to init', ->
      class A2
      assert.equal inherits(A2, A), true
      a = createObject(A2, "hiFirst", 1881)
      assert.instanceOf a, A2
      assert.instanceOf a, A
      assert.instanceOf a, Root
      assert.equal a.inited, "hiFirst"
      assert.equal a.other, 1881
    it 'should pass the correct arguments to constructor', ->
      A2 = (@first, @second)->
      assert.equal inherits(A2, A), true
      a = createObject(A2, "hiFirst", 1881)
      assert.instanceOf a, A2
      assert.instanceOf a, A
      assert.instanceOf a, Root
      assert.equal a.first, "hiFirst"
      assert.equal a.second, 1881
      should.not.exist a.inited
      should.not.exist a.other
    it 'should add new "Class" property to the class prototype', ->
      class A2
      a = createObject A2
      assert.instanceOf a, A2
      a.should.have.property 'Class', A2

  describe "createObjectWith", ->

    it 'should call the parent\'s constructor method if it no constructor', ->
      class A12
      assert.equal inherits(A12, A1), true
      a = createObjectWith(A12)
      assert.instanceOf a, A12
      assert.instanceOf a, A1
      assert.instanceOf a, A
      assert.instanceOf a, Root
      assert.equal a.inited, "A1"

    it 'should call the root\'s constructor method if its parent no constructor yet', ->
      class A2
      assert.equal inherits(A2, A), true
      a = createObjectWith(A2)
      assert.instanceOf a, A2
      assert.instanceOf a, A
      assert.instanceOf a, Root
      assert.equal a.inited, "Root"
    ### known issue:
    # the prototype is copy from parent class, so child class do not known the
    # parent's changes.
    #   : aClass.prototype = Object.create(aParentClass.prototype)
    it 'should inherits a parent class after', ->
      class A1
      class A2
      assert.equal inherits(A2, A1), true
      inherits(A1, A)
      a = new A2()
      assert.equal isInheritedFrom(A2, A), A1
      assert.instanceOf a, A
    ###
    it 'should pass the correct arguments to init', ->
      class A2
      assert.equal inherits(A2, A), true
      a = createObjectWith(A2, ["hiFirst", 1881])
      assert.instanceOf a, A2
      assert.instanceOf a, A
      assert.equal a.inited, "hiFirst"
      assert.equal a.other, 1881
    it 'should pass the correct arguments to constructor', ->
      class A2
        constructor: (@first, @second)->
      assert.equal inherits(A2, A), true
      a = createObjectWith(A2, ["hiFirst", 1881])
      assert.instanceOf a, A2
      assert.instanceOf a, A
      assert.instanceOf a, Root
      assert.equal a.first, "hiFirst"
      assert.equal a.second, 1881
      a.should.not.have.ownProperty 'inited'
      a.should.not.have.ownProperty 'other'
    it 'should pass the correct arguments to init for internal arguments', ->
      class A2
        constructor: ->
          if not (this instanceof A2)
            return createObjectWith(A2, arguments)
          super
      assert.equal inherits(A2, A), true
      a = A2("hiFirst~", 1181)
      assert.instanceOf a, A2
      assert.instanceOf a, A
      assert.instanceOf a, Root
      assert.equal a.inited, "hiFirst~"
      assert.equal a.other, 1181
    it 'should add new "Class" property to the class prototype', ->
      class A2
      a = createObjectWith A2
      assert.instanceOf a, A2
      a.should.have.property 'Class', A2


describe "mixin", ->
  it "should mixin class", ->
    class Root
    class A
      aMethod: ->
    class B1
      b1Method: ->
    class B2
      b2Method: ->
    B1.staticMethod = ->
    inherits(A, Root).should.be.equal true
    isInheritedFrom(A, Root).should.be.equal A, "A is inherits from Root"
    mixin(A, [B1, B2]).should.be.equal true
    assert.ok A.hasOwnProperty('mixinCtor_')
    assert.ok A.hasOwnProperty('mixinCtors_')
    assert.notOk A.propertyIsEnumerable('mixinCtor_')
    assert.notOk A.propertyIsEnumerable('mixinCtors_')
    A.should.have.property 'staticMethod'
    a = new A()
    a.should.have.property 'b1Method'
    a.should.have.property 'b2Method'
    a.should.have.property 'aMethod'

    isInheritedFrom(A, Root).should.be.equal A, "A is inherits from Root"
    isMixinedFrom(A, B1).should.be.equal true, "A is mixined from B1"
    isMixinedFrom(A, B2).should.be.equal true, "A is mixined from B2"
    isMixinedFrom(A, 'B1').should.be.equal true, "A is mixined from B1"
    isMixinedFrom(A, 'B2').should.be.equal true, "A is mixined from B2"

  it "should first mixin class then inherits", ->
    class Root
    class A
      aMethod: ->
    class B1
      b1Method: ->
    class B2
      b2Method: ->
    mixin(A, [B1, B2]).should.be.equal true, 'mixin'
    inherits(A, Root).should.be.equal true, "inherits"
    isInheritedFrom(A, Root).should.be.equal A, "A is inherits from Root"
    a = new A()
    a.should.have.property 'b1Method'
    a.should.have.property 'b2Method'
    a.should.have.property 'aMethod'

    isInheritedFrom(A, Root).should.be.equal A, "A is inherits from Root"
    isMixinedFrom(A, B1).should.be.equal true, "A is mixined from B1"
    isMixinedFrom(A, B2).should.be.equal true, "A is mixined from B2"

  it "should call super function in a mixined class", ->
    class Root
      m: sinon.spy ->
        mCallOrder.push 'Root'
    class C
      m: ->
        mCallOrder.push 'C'
        super
    class A
      m: sinon.spy ->
        mCallOrder.push 'A'
    class A1
      m: ->
        mCallOrder.push 'A1'
        super
    class B
    class B1
      m: ->
        mCallOrder.push 'B1'
        super

    inherits(C, Root).should.be.equal true, "C should inherits from Root"
    inherits(B1, B).should.be.equal true, "B1 should inherits from B"
    inherits(A1, A).should.be.equal true, "A1 should inherits from A"
    mixin(B1, [A1, C]).should.be.equal true, 'mixin'

    mCallOrder = []
    o = new B1()
    o.m("a", 12) # call chain: B1::m -> C::m -> Root::m
    Root::m.should.have.been.calledOnce
    Root::m.should.have.been.calledWith "a", 12
    mCallOrder.should.be.deep.equal ['B1', 'C', 'Root']

  it "should throw error when super function in a mixined class", ->
    class A
      m: -> super
    class B

    expect(mixin.bind(null, B, A, filter: mixin.filterOpts.errSuper)).to.throw('method: should not use super');

  it "should throw error when filter option value error in a mixined class", ->
    class A
      m: -> super
    class B

    expect(mixin.bind(null, B, A, filter: 9999)).to.throw('filter option value error');

  it "should skip super method when super function in a mixined class", ->
    class A
      m: -> super
      m1: ->
    class B

    mixin(B, A, filter: mixin.filterOpts.skipSuper).should.be.equal true, 'mixin'
    B.prototype.should.have.not.property 'm'
    B.prototype.should.have.property 'm1'

  it "should allow properties in the filter array only in a mixined class", ->
    class A
      m: ->
      m1: ->
      nosuch: 1
      got: 2
    class B

    mixin(B, A, filter: ['m', 'got']).should.be.equal true, 'mixin'
    B.prototype.should.have.not.property 'm1'
    B.prototype.should.have.not.property 'nosuch'
    B.prototype.should.have.property 'm'
    B.prototype.should.have.property 'got'

  it "should call super function in a mixined class and no mixined method in itself", ->
    class Root
      m: sinon.spy ->
        mCallOrder.push 'Root'
    class C
      m: ->
        mCallOrder.push 'C'
        super
    class A
      m: ->
        mCallOrder.push 'A'
        super
    class A1
      m: ->
        mCallOrder.push 'A1'
        super
    class B
    class B1

    inherits(C, Root).should.be.equal true, "C should inherits from Root"
    inherits(B1, B).should.be.equal true, "B1 should inherits from B"
    inherits(A1, [A, Root]).should.be.equal true, "A1 should inherits from A"
    mixin(B1, A1).should.be.equal true, 'mixin'

    mCallOrder = []
    o = new B1()
    o.m("a", 12) # call chain:  A1::m -> A::m
    mCallOrder.should.be.deep.equal ['A1', 'A', 'Root']

    mCallOrder = []
    mixin(B1, C).should.be.equal true, 'mixin'
    mixin(B1, [A1, C]).should.be.equal false, 'dup mixin'
    mixin(B1, A1).should.be.equal false, 'dup mixin A1'
    mixin(B1, C).should.be.equal false, 'dup mixin C'
    # log(getProtoChain(B1))

    o = new B1()
    o.m("a", 12) # call chain:  C::m -> Root::m
    mCallOrder.should.be.deep.equal ['C', 'Root']

    Root::m.should.have.been.calledTwice
    Root::m.should.have.been.calledWith "a", 12


