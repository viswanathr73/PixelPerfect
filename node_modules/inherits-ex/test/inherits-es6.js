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
var getPrototypeOf  = require('../src/getPrototypeOf')

var log             = console.log.bind(console)

chai.use(sinonChai)


var compareProtoChain = function(o, list){
  var p = getProtoChain(o)
  for (var i=0; i < p.length; i++) {
    n=p[i]
    if (n !== list[i]) return false
  }
  return true
}

describe("inheritsES6", function() {

  aMethod = () => "aMethod"
  a1Method = () => "a1Method"

  class Root {
    // static test= 1;
    constructor(inited="Root", other) {
      this.inited= inited
      this.other = other
      return "Root"
    }
    rootMethod(){}
  }
  Root.test = 1

  class B {
    constructor(inited="B") {
      this.inited=inited
      return "B"
    }
    bMethod(){}
  }

  class A {
  }
  A.prototype.aMethod = aMethod
  assert.equal(inherits(A, Root), true)

  class A1 {
    constructor(inited = "A1") {
      this.inited = inited
      return "A1"
    }
  }
  A1.prototype.a1Method = a1Method
  inherits(A1,A)

  it("test inherits with extends parent class", function() {
    class B extends A1{
    }

    inherits(B, A1)
    var obj = new B
    assert.equal(obj.inited, 'A1')
    assert.equal(B.super_, A1)
    assert.equal(B.__super__, A1.prototype)
    assert.equal(B.prototype.Class, B)
  })

  it("test inherits and call super parent class", function() {
    class B {
      constructor() {
        var result = new this.constructor.super_()
        return result;
      }
    }

    inherits(B, A1)
    var obj = new B
    assert.equal(obj.inited, 'A1')
  })

  it("test inherits with none static inheritance", function() {
    class R{
      // static test = 1
      constructor(inited="R", other){
        this.inited=inited
        this.other=other
        return "R"
      }
      rootMethod(){}
    }
    R.test = 1

    class R1{
      constructor(inited="B"){
        this.inited=inited
        return "B"
      }
      bMethod(){}
    }

    assert.equal(inherits(R1, R, false), true)
    assert.isUndefined(R1.test)
  })

  it("test inherits and isInheritedFrom", function(){
    assert.equal(inherits(A, Root), false)
    assert.equal(inherits(B, Root), true)
    assert.equal(A.test, 1)
    assert.equal(B.test, 1)
    assert.equal(A1.test, 1)
    assert.ok(Root.isPrototypeOf(A1))
    assert.equal(A1.super_, A)
    assert.notOk(A1.propertyIsEnumerable('super_'))
    assert.notOk(A1.propertyIsEnumerable('__super__'))
    assert.equal(A1.prototype.a1Method, a1Method)
    assert.equal(A.prototype.aMethod, aMethod)
    assert.equal(A1.prototype.constructor, A1)
    assert.equal(inherits(A1, Root), false, "A1 can not inherit Root again")
    assert.equal(A1.super_, A)
    assert.equal(A.super_, Root)
    assert.equal(Root.super_, undefined)
    assert.equal(isInheritedFrom(A, Root), A)
    assert.equal(isInheritedFrom(A1, Root), A)
    assert.equal(isInheritedFrom(A1, A), A1)
    assert.equal(isInheritedFrom(A1, B), false, "A1 is not inherited from B")
    assert.equal(isInheritedFrom(A, B), false, "A is not inherited from B")
    o = new A()
    assert.equal(o.rootMethod, Root.prototype.rootMethod)
    o = new A1()
    assert.equal(o.rootMethod, Root.prototype.rootMethod)
    assert.deepEqual(getProtoChain(A1), [ 'Root', 'A', 'A1' ])
  })
  it("should not inheritances dead circular", function(){
    class C1{}
    class C2{}
    class C3{}
    assert.equal(inherits(C1, C2), true)
    assert.equal(inherits(C2, C3), true)
    assert.equal(inherits(C3, C1), false)
  })

  it("should multi-inheritances", function(){
    class C{}
    class D{}
    class E{}
    class MyClass{}
    // MyClass -> C -> D -> E
    assert.equal(inherits(MyClass, [C, D, E]), true)
    assert.deepEqual(getProtoChain(MyClass), ['E', 'D', 'C', 'MyClass'])
  })
  it("should multi-inheritances and void circular inherit", function(){
    class C{}
    class MyClass{}
    class B{}
    // C -> Root
    assert.equal(inherits(C, Root), true);
    // B -> Root
    assert.equal(inherits(B, Root), true);

    //# MyClass -> B -> Root
    assert.equal(inherits(MyClass, B), true)

    //# MyClass -> C -> B -> Root
    assert.equal(inherits(MyClass, C), true)
    assert.deepEqual(getProtoChain(MyClass), [ 'Root', 'B', 'C', 'MyClass'])
    assert.equal(isInheritedFrom(MyClass, C), MyClass)
    assert.equal(isInheritedFrom(MyClass, B), C)
    assert.equal(isInheritedFrom(MyClass, 'C'), MyClass)
    assert.equal(isInheritedFrom(MyClass, 'B'), C)
  })
  it("should multi-inheritances and void circular inherit2", () => {
    class Ctor {}
    class CtorParent {}
    class CtorRoot {}
    inherits(Ctor, [CtorParent, CtorRoot])
    class SuperCtor {}
    class SuperParent {}
    inherits(SuperCtor, SuperParent)
    assert.equal(inherits(Ctor, SuperCtor), true);
    assert.deepEqual(getProtoChain(Ctor), ['CtorRoot', 'CtorParent', 'SuperParent', 'SuperCtor', 'Ctor']);
  });
  it("should multi-inheritances and void circular inherit3", () => {
    class CtorRoot {}
    class CtorParent extends CtorRoot{}
    class Ctor extends CtorParent{}
    class SuperParent {}
    class SuperCtor extends SuperParent{}
    assert.equal(inherits(Ctor, SuperCtor), true);
    assert.deepEqual(getProtoChain(Ctor), ['CtorRoot', 'CtorParent', 'SuperParent', 'SuperCtor', 'Ctor']);
  });
  it("test isInheritedFrom with class name", function(){
    isInheritedFrom = isInheritedFrom
    assert.equal(isInheritedFrom(A, 'Root'), A)
    assert.equal(isInheritedFrom(A1, 'Root'), A)
    assert.equal(isInheritedFrom(A1, 'A'), A1)
    assert.equal(isInheritedFrom(A1, 'B'), false, "A1 is not inherited from B")
    assert.equal(isInheritedFrom(A, 'B'), false, "A is not inherited from B")
  })

  it("test inheritsObject", function(){
    var cMethod = ()=> "cMethod"
    var C = function(){return  "C"}

    C.name = "C"
    C.prototype.cMethod = cMethod
    var b = new B()
    assert.equal(inheritsObject(b, C), true)
    // bProto = b.__proto__
    bProto = getPrototypeOf(b)
    assert.equal(bProto.cMethod, cMethod)
    assert.equal(bProto.constructor, C)
    assert.equal(C.super_, B)
    var b1 = new B()
    b1.should.have.property('Class', B)
    assert.equal(inheritsObject(b1, C), true)
    // bProto = b1.__proto__
    bProto = getPrototypeOf(b1)
    assert.equal(bProto.cMethod, cMethod)
    assert.equal(bProto.constructor, C)
    assert.equal(bProto, C.prototype)
  })
  it("test inheritsDirectly and isInheritedFrom", function(){
    var cMethod = ()=> "cMethod"
    var R = function(){return  "R"}
    R.name = "R"
    var C = function(){return  "C"}
    C.name = "C"
    C.prototype.cMethod = cMethod

    var C1 = function() {return "C1"}
    C1.name = "C1"
    var C11 = function()  {return "C11"}
    C11.name = "C11"
    var C2 = function()  {return "C2"}

    assert.ok(inherits(C, R), "C inherits from R")
    assert.ok(inherits(C1, C), "C1 inherits from C")
    assert.ok(inherits(C11, C1), "C11 inherits from C1")
    assert.ok(inherits(C2, C), "C2 inherits from C")
    //# C11 > C1 > C
    baseClass = isInheritedFrom(C11, C)
    assert.equal(baseClass, C1)
    inheritsDirectly(baseClass, C2)
    //# C11 > C1 > C2 > C
    assert.equal(isInheritedFrom(C11, C2), C1, "C11 > C2")
    assert.equal(isInheritedFrom(C11, C1), C11, "C11 > C1")
    assert.equal(isInheritedFrom(C11, C), C2, "C11 > C")
  })
  it("test Es6 isIneritedFrom", function() {
    class R{}
    class C extends R{}
    class C1 extends C{}
    class C11 extends C1{}
    class C2 extends C{}
    //# C11 > C1 > C
    baseClass = isInheritedFrom(C11, C)
    assert.equal(baseClass, C1)
    inheritsDirectly(baseClass, C2)
    //# C11 > C1 > C2 > C
    assert.equal(isInheritedFrom(C11, C2), C1, "C11 > C2")
    assert.equal(isInheritedFrom(C11, C1), C11, "C11 > C1")
    assert.equal(isInheritedFrom(C11, C), C2, "C11 > C")
  })
  it("test Es6 class and function mixed super()", function() {
    var mCallOrder = []
    class R{
      m(){
        mCallOrder.push('R')
      }
    }
    class T extends R{
      m() {
        super.m(...arguments);
        mCallOrder.push('T');
      }
    }
    function T1(){}
    T1.prototype.m = function() {
      var vSuper = getPrototypeOf(T1);
      vSuper.prototype.m.call(this);
      mCallOrder.push('T1');
    }
    class T11{
      m() {
        super.m(...arguments);
        mCallOrder.push('T11');
      }
    }

    assert.equal(inherits(T11, T1), true, 'inherits T11, T1')
    assert.equal(inherits(T1, T), true, 'inherits T1, T')
    var a= new T11
    a.m()
    assert.deepEqual(mCallOrder, [ 'R', 'T', 'T1', 'T11' ])
  })
  it('should ES6 class and function ctor mixed', () => {
    class Animal {
      constructor(name) {
        this.name = name;
      }
      speak(sound) {
        return this.name + ' ' + sound;
      }
    }
    class Dog extends Animal {
      constructor(name, breed) {
        super(name);
        this.breed = breed;
      }
      speak(sound) {
        if (!sound) sound = 'barks';
        return super.speak(sound);
      }
    }
    function Cat(name, breed) {
      this.name = name;
      this.breed = breed;
    }
    Cat.prototype.meow = function() {
      return this.Class.__super__.speak.call(this, 'meows');
    };
    assert.equal(inherits(Cat, Animal), true);
    const fluffy = new Cat('Fluffy', 'Siamese');
    assert.equal(fluffy.speak('meows.'), 'Fluffy meows.');
    assert.equal(fluffy.meow('meows'), 'Fluffy meows');
  });


  describe("createObject", function(){

    it('should create object with ES6 class', function(){
      class A {}
      result = createObject(A)
      result.should.be.instanceof(A)
      A.should.not.have.ownProperty('Class')
    })
    it('should call the parent\'s constructor method if it no constructor', function(){
      function A12() {}
      assert.equal(inherits(A12, A1), true)
      a = createObject(A12)
      assert.equal(a.Class, A12)
      assert.instanceOf(a, A12)
      assert.instanceOf(a, A1)
      assert.instanceOf(a, A)
      assert.instanceOf(a, Root)
      assert.equal(a.inited, "A1")
    })
    it('should call the root\'s constructor method if its parent no constructor yet', function(){
      //ES6 Class can not supports this.
      //the class X defined, toString should be 'class X{}', not 'function X(){}'
      function A2(){}
      assert.equal(inherits(A2, A), true)
      a = createObject(A2)
      assert.equal(a.Class, A2)
      assert.instanceOf(a, A2)
      assert.instanceOf(a, A)
      assert.instanceOf(a, Root)
      assert.equal(a.inited, "Root")
    })
    it('should pass the correct arguments to init', function(){
      class A2 {
        constructor(inited, other){
          this.inited = inited
          this.other = other
        }
      }
      assert.equal(inherits(A2, A), true)
      a = createObject(A2, "hiFirst", 1881)
      assert.instanceOf(a, A2)
      assert.instanceOf(a, A)
      assert.instanceOf(a, Root)
      assert.equal(a.inited, "hiFirst")
      assert.equal(a.other, 1881)
    })
    it('should add new "Class" property to the class prototype', function() {
      class A2{}
      a = createObject (A2)
      assert.instanceOf(a, A2)
      a.should.have.property('Class', A2)
    })

    it('should call correct instance method on the root constructor', function() {
      class R {
        constructor(opt) {
          this.init(opt)
        }

        init(opt) {
          let result = 'R'
          if (opt) result += opt
          return result
        }
      }
      class A2{
        init(opt) {
          const result = this.Class.__super__.init(opt)
          this.inited = result + 'A2'
        }
      }
      inherits(A2, R)
      let a = createObject(A2, 'Opt')
      assert.instanceOf(a, A2)
      a.should.have.property('Class', A2)
      a.should.have.property('inited', 'ROptA2')
      a = createObjectWith(A2, ['O2'])
      a.should.have.property('Class', A2)
      a.should.have.property('inited', 'RO2A2')
    })

    it('have to write the constructor to derived class too for ES6 class', function() {
      class R {
        constructor() {
          this.init()
        }

        init() {
          return 'R'
        }
      }
      class A2{
        constructor() {
          this.init()
        }
        init() {
          const Parent = this.constructor.__super__
          const result = [Parent.init.apply(this, arguments)];
          result.push('A2')
          this.inited = result
        }
      }
      inherits(A2, R)
      a = createObject(A2)
      assert.instanceOf(a, A2)
      a.should.have.property('Class', A2)
      a.should.have.property('inited')
      a.inited.should.deep.equal([ 'R', 'A2' ])
    })

    it('use function Root class instead of ES6 class', function() {
      function R() {this.init()}
      R.prototype.init = function() {return 'R'}

      class A2{
        init() {
          const Parent = this.Class.__super__
          const result = [Parent.init.apply(this, arguments)];
          result.push('A2')
          this.inited = result
        }
      }
      inherits(A2, R).should.be.ok
      a = createObject(A2)
      assert.instanceOf(a, A2)
      a.should.have.property('Class', A2)
      a.should.have.property('inited')
      a.inited.should.deep.equal([ 'R', 'A2' ])
    })

  })
})

