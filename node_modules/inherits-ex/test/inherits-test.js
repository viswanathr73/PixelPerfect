var chai            = require('chai')
var sinon           = require('sinon')
var sinonChai       = require('sinon-chai')
var assert          = chai.assert
var expect          = chai.expect
var should          = chai.should()
chai.use(sinonChai);

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

// const getPrototypeOf = Object.getPrototypeOf
// const objPrototype = getPrototypeOf(Object)

/*
let a = 0
function getSuperProto(instance) {
  if (++a > 10) process.exit()
  const ctor = getPrototypeOf(instance)
  const superProto = getPrototypeOf(ctor)
  return superProto;
}
*/

// const log             = console.log.bind(console)

/*
function getProtoChain(p) {
  let name;
  const result = (function() {
    const results = [];
    while (p) {
      if (p === Object) {
        name = "Base";
      } else {
        name = p.name;
      }
      p = p.super_;
      results.push(name);
    }
    return results;
  })();
  return result.reverse();
};
*/

function compareProtoChain(o, list) {
  let i, j, len, n;
  const p = getProtoChain(o);
  for (i = j = 0, len = p.length; j < len; i = ++j) {
    n = p[i];
    if (n !== list[i]) {
      return false;
    }
  }
  return true;
};

describe("inherits", function() {
  function aMethod() {
    return "aMethod";
  };
  function a1Method() {
    return "a1Method";
  };

  function Root(inited = "Root", other) {
    this.inited = inited;
    this.other = other;
    return "Root";
  }
  Root.prototype.rootMethod = function rootMethod() {}

  Root.test = 1;


  function B(inited = "B") {
    this.inited = inited;
    return "B";
  }
  B.prototype.bMethod = function() {}

  function A() {};
  A.prototype.aMethod = aMethod;

  function A1(inited = "A1") {
    this.inited = inited;
    return "A1";
  }
  A1.prototype.a1Method = a1Method;


  it("test inherits with none static inheritance", function() {
    function R(inited, other) {
      this.inited = inited || "R";
      this.other = other;
      return "R";
    }
    R.prototype.rootMethod = function() {}
    R.test = 1;

    function R1(inited) {
      this.inited = inited || "B";
      return "B";
    }
    assert.equal(inherits(R1, R, false), true);
    assert.isUndefined(R1.test);
  });
  it("test inherits and isInheritedFrom", function() {
    let o;
    assert.equal(inherits(A, Root), true);
    assert.equal(inherits(A, Root), false);
    assert.equal(inherits(B, Root), true);
    assert.equal(inherits(A1, A), true);
    assert.equal(A.test, 1);
    assert.equal(B.test, 1);
    assert.equal(A1.test, 1);
    assert.ok(Root.isPrototypeOf(A1));
    assert.equal(A1.super_, A);
    assert.notOk(A1.propertyIsEnumerable('super_'));
    assert.notOk(A1.propertyIsEnumerable('__super__'));
    assert.equal(A1.prototype.a1Method, a1Method);
    assert.equal(A.prototype.aMethod, aMethod);
    assert.equal(A1.prototype.constructor, A1);
    assert.equal(inherits(A1, Root), false, "A1 can not inherit Root again");
    assert.equal(A1.super_, A);
    assert.equal(A.super_, Root);
    assert.equal(Root.super_, undefined);
    assert.equal(isInheritedFrom(A, Root), A);
    assert.equal(isInheritedFrom(A1, Root), A);
    assert.equal(isInheritedFrom(A1, A), A1);
    assert.equal(isInheritedFrom(A1, B), false, "A1 is not inherited from B");
    assert.equal(isInheritedFrom(A, B), false, "A is not inherited from B");
    o = new A();
    assert.equal(o.rootMethod, Root.prototype.rootMethod);
    o = new A1();
    assert.equal(o.rootMethod, Root.prototype.rootMethod);
    assert.deepEqual(getProtoChain(A1), ['Root', 'A', 'A1']);
  });
  it("should not inheritances dead circular", function() {
    function C1() {};
    function C2() {};
    function C3() {};
    assert.equal(inherits(C1, C2), true);
    assert.equal(inherits(C2, C3), true);
    assert.equal(inherits(C3, C1), false);
  });
  it("should multi-inheritances", function() {
    function C() {};
    function D() {};
    function E() {};
    function MyClass() {};
    // MyClass -> C -> D -> E
    assert.equal(inherits(MyClass, [C, D, E]), true);
    assert.deepEqual(getProtoChain(MyClass), ['E', 'D', 'C', 'MyClass']);
  });
  it("should multi-inheritances and void circular inherit", function() {
    function C      () {};
    function MyClass() {};
    function B() {};
    // C -> Root
    assert.equal(inherits(C, Root), true);
    // B -> Root
    assert.equal(inherits(B, Root), true);
    // MyClass -> B -> Root
    assert.equal(inherits(MyClass, B), true);
    // MyClass -> C -> B -> Root
    assert.equal(inherits(MyClass, C), true);
    assert.deepEqual(getProtoChain(MyClass), ['Root', 'B', 'C', 'MyClass']);
    assert.equal(isInheritedFrom(MyClass, C), MyClass);
    assert.equal(isInheritedFrom(MyClass, B), C);
    assert.equal(isInheritedFrom(MyClass, 'C'), MyClass);
    assert.equal(isInheritedFrom(MyClass, 'B'), C);
  });
  it("should multi-inheritances and void circular inherit2", () => {
    function Ctor() {}
    function CtorParent() {}
    function CtorRoot() {}
    function SuperCtor() {}
    function SuperParent() {}
    // Ctor -> CtorParent -> CtorRoot
    inherits(Ctor, [CtorParent, CtorRoot])
    // SuperCtor -> SuperParent
    inherits(SuperCtor, SuperParent)
    assert.equal(inherits(Ctor, SuperCtor), true);
    assert.deepEqual(getProtoChain(Ctor), ['CtorRoot', 'CtorParent', 'SuperParent', 'SuperCtor', 'Ctor']);
  });
  it("test isInheritedFrom with class name", function() {
    assert.equal(isInheritedFrom(A, 'Root'), A);
    assert.equal(isInheritedFrom(A1, 'Root'), A);
    assert.equal(isInheritedFrom(A1, 'A'), A1);
    assert.equal(isInheritedFrom(A1, 'B'), false, "A1 is not inherited from B");
    assert.equal(isInheritedFrom(A, 'B'), false, "A is not inherited from B");
  });
  it("test inheritsObject", function() {
    function cMethod() {
      return "cMethod";
    };
    function C() {
      return "C";
    };
    C.name = "C";
    C.prototype.cMethod = cMethod;
    const b = new B();
    assert.equal(inheritsObject(b, C), true);
    let bProto = getPrototypeOf(b);
    assert.equal(bProto.cMethod, cMethod);
    assert.equal(bProto.constructor, C);
    assert.equal(C.super_, B);
    const b1 = new B();
    assert.equal(inheritsObject(b1, C), true);
    bProto = getPrototypeOf(b1);
    assert.equal(bProto.cMethod, cMethod);
    assert.equal(bProto.constructor, C);
    assert.equal(bProto, C.prototype);
  });
  it("test inheritsDirectly and isInheritedFrom", function() {
    function cMethod() {
      return "cMethod";
    };
    function R() {
      return "R";
    };
    R.name = "R";
    function C() {
      return "C";
    };
    C.name = "C";
    C.prototype.cMethod = cMethod;
    function C1() {
      return "C1";
    };
    C1.name = "C1";
    function C11() {
      return "C11";
    };
    C11.name = "C11";
    function C2() {
      return "C2";
    };
    assert.ok(inherits(C, R), "C inherits from R");
    assert.ok(inherits(C1, C), "C1 inherits from C");
    assert.ok(inherits(C11, C1), "C11 inherits from C1");
    assert.ok(inherits(C2, C), "C2 inherits from C");
    // C11 > C1 > C
    const baseClass = isInheritedFrom(C11, C);
    assert.equal(baseClass, C1);
    inheritsDirectly(baseClass, C2);
    // C11 > C1 > C2 > C
    assert.equal(isInheritedFrom(C11, C2), C1, "C11 > C2");
    assert.equal(isInheritedFrom(C11, C1), C11, "C11 > C1");
    assert.equal(isInheritedFrom(C11, C), C2, "C11 > C");
  });
  it('should inherits a parent function constructor', ()=>{
    function A() {}
    function A1() {}
    function A2() {}
    assert.equal(inherits(A1, A), true)
    assert.equal(inherits(A2, A1), true)
    const a = new A2()
    assert.equal(isInheritedFrom(A2, A), A1)
    assert.instanceOf(a, A)
  })
  it('should inherits a parent class after', function() {
    function A() {}
    function A1() {}
    function A2() {}
    assert.equal(inherits(A2, A1), true)
    assert.equal(inherits(A1, A), true)
    const a = new A2()
    assert.equal(isInheritedFrom(A2, A), A1)
    assert.instanceOf(a, A)
  })
  describe("createObject", function() {
    it('should create plain object', function() {
      let result;
      result = createObject(Object);
      result.should.be.instanceof(Object);
      Object.should.not.have.ownProperty('Class');
    });
    it('should create Array object', function() {
      const result = createObject(Array, 12, 34);
      result.should.be.instanceof(Array);
      result.should.be.deep.equal([12, 34]);
      Object.should.not.have.ownProperty('Class');
    });
    it('should create RegExp object', function() {
      const result = createObject(RegExp, '^as.*', 'i');
      result.should.be.instanceof(RegExp);
      result.source.should.be.equal('^as.*');
      result.ignoreCase.should.be.true;
      Object.should.not.have.ownProperty('Class');
    });
    it('should call the parent\'s constructor method if it no constructor', function() {
      function A12() {};
      assert.equal(inherits(A12, A1), true);
      const a = createObject(A12);
      assert.equal(a.Class, A12);
      assert.instanceOf(a, A12);
      assert.instanceOf(a, A1);
      assert.instanceOf(a, A);
      assert.instanceOf(a, Root);
      assert.equal(a.inited, "A1");
    });
    it('should call the root\'s constructor method if its parent no constructor yet', function() {
      function A2() {};
      assert.equal(inherits(A2, A), true);
      const a = createObject(A2);
      assert.equal(a.Class, A2);
      assert.instanceOf(a, A2);
      assert.instanceOf(a, A);
      assert.instanceOf(a, Root);
      assert.equal(a.inited, "Root");
    });
    it('should pass the correct arguments to init', function() {
      function A2() {};
      assert.equal(inherits(A2, A), true);
      const a = createObject(A2, "hiFirst", 1881);
      assert.instanceOf(a, A2);
      assert.instanceOf(a, A);
      assert.instanceOf(a, Root);
      assert.equal(a.inited, "hiFirst");
      assert.equal(a.other, 1881);
    });
    it('should pass the correct arguments to constructor', function() {
      function A2(first, second) {
        this.first = first;
        this.second = second;
      };
      assert.equal(inherits(A2, A), true);
      const a = createObject(A2, "hiFirst", 1881);
      assert.instanceOf(a, A2);
      assert.instanceOf(a, A);
      assert.instanceOf(a, Root);
      assert.equal(a.first, "hiFirst");
      assert.equal(a.second, 1881);
      should.not.exist(a.inited);
      should.not.exist(a.other);
    });
    it('should add new "Class" property to the class prototype', function() {
      function A2() {};
      const a = createObject(A2);
      assert.instanceOf(a, A2);
      a.should.have.property('Class', A2);
    });
  });
  describe("createObjectWith", function() {
    it('should call the parent\'s constructor method if it no constructor', function() {
      function A12() {};
      assert.equal(inherits(A12, A1), true);
      const a = createObjectWith(A12);
      assert.instanceOf(a, A12);
      assert.instanceOf(a, A1);
      assert.instanceOf(a, A);
      assert.instanceOf(a, Root);
      assert.equal(a.inited, "A1");
    });
    it('should call the root\'s constructor method if its parent no constructor yet', function() {
      function A2() {};
      assert.equal(inherits(A2, A), true);
      const a = createObjectWith(A2);
      assert.instanceOf(a, A2);
      assert.instanceOf(a, A);
      assert.instanceOf(a, Root);
      assert.equal(a.inited, "Root");
    });
    it('should pass the correct arguments to init', function() {
      function A2() {};
      assert.equal(inherits(A2, A), true);
      const a = createObjectWith(A2, ["hiFirst", 1881]);
      assert.instanceOf(a, A2);
      assert.instanceOf(a, A);
      assert.equal(a.inited, "hiFirst");
      assert.equal(a.other, 1881);
    });
    it('should pass the correct arguments to constructor', function() {
      class A2 {
        constructor(first, second) {
          this.first = first;
          this.second = second;
        }

      };
      assert.equal(inherits(A2, A), true);
      const a = createObjectWith(A2, ["hiFirst", 1881]);
      assert.instanceOf(a, A2);
      assert.instanceOf(a, A);
      assert.instanceOf(a, Root);
      assert.equal(a.first, "hiFirst");
      assert.equal(a.second, 1881);
      a.should.not.have.ownProperty('inited');
      a.should.not.have.ownProperty('other');
    });
    it('should pass the correct arguments to init for internal arguments', function() {
      function A2() {
        if (!(this instanceof A2)) {
          return createObjectWith(A2, arguments);
        }
        const Parent = getPrototypeOf(getPrototypeOf(this)).constructor;
        return Parent.apply(this, arguments)
        return Reflect.construct(Parent, arguments, A2)
      }
      inherits(A, Root);
      assert.equal(inherits(A2, A), true);
      const a = A2("hiFirst~", 1181);
      assert.instanceOf(a, A2);
      assert.instanceOf(a, A);
      assert.instanceOf(a, Root);
      assert.equal(a.inited, "hiFirst~");
      assert.equal(a.other, 1181);
    });
    it('should add new "Class" property to the class prototype', function() {
      function A2() {};
      const a = createObjectWith(A2);
      assert.instanceOf(a, A2);
      a.should.have.property('Class', A2);
    });
  });
});

describe("mixin", function() {
  it("should mixin class", function() {
    function Root() {};
    class A {
      aMethod() {}

    };
    class B1 {
      b1Method() {}

    };
    class B2 {
      b2Method() {}

    };
    B1.staticMethod = function() {};
    inherits(A, Root).should.be.equal(true);
    isInheritedFrom(A, Root).should.be.equal(A, "A is inherits from Root");
    mixin(A, [B1, B2]).should.be.equal(true);
    assert.ok(A.hasOwnProperty('mixinCtor_'));
    assert.ok(A.hasOwnProperty('mixinCtors_'));
    assert.notOk(A.propertyIsEnumerable('mixinCtor_'));
    assert.notOk(A.propertyIsEnumerable('mixinCtors_'));
    A.should.have.property('staticMethod');
    const a = new A();
    a.should.have.property('b1Method');
    a.should.have.property('b2Method');
    a.should.have.property('aMethod');
    isInheritedFrom(A, Root).should.be.equal(A, "A is inherits from Root");
    isMixinedFrom(A, B1).should.be.equal(true, "A is mixined from B1");
    isMixinedFrom(A, B2).should.be.equal(true, "A is mixined from B2");
    isMixinedFrom(A, 'B1').should.be.equal(true, "A is mixined from B1");
    isMixinedFrom(A, 'B2').should.be.equal(true, "A is mixined from B2");
  });
  it("should first mixin class then inherits", function() {
    function Root() {};
    class A {
      aMethod() {}

    };
    class B1 {
      b1Method() {}

    };
    class B2 {
      b2Method() {}

    };
    mixin(A, [B1, B2]).should.be.equal(true, 'mixin');
    inherits(A, Root).should.be.equal(true, "inherits");
    isInheritedFrom(A, Root).should.be.equal(A, "A is inherits from Root");
    const a = new A();
    a.should.have.property('b1Method');
    a.should.have.property('b2Method');
    a.should.have.property('aMethod');
    isInheritedFrom(A, Root).should.be.equal(A, "A is inherits from Root");
    isMixinedFrom(A, B1).should.be.equal(true, "A is mixined from B1");
    isMixinedFrom(A, B2).should.be.equal(true, "A is mixined from B2");
  });
  it("should call super function in a mixined class", function() {
    let mCallOrder = [];
    function Root() {};

    Root.prototype.m = sinon.spy(function() {
      return mCallOrder.push('Root');
    });

    class C {
      m() {
        mCallOrder.push('C');
        return super.m(...arguments);
      }

    };
    function A() {};

    A.prototype.m = sinon.spy(function() {
      return mCallOrder.push('A');
    });

    class A1 {
      m() {
        mCallOrder.push('A1');
        return super.m(...arguments);
      }

    };
    function B() {};
    class B1 {
      m() {
        mCallOrder.push('B1');
        return super.m(...arguments);
      }

    };
    inherits(C, Root).should.be.equal(true, "C should inherits from Root");
    inherits(B1, B).should.be.equal(true, "B1 should inherits from B");
    inherits(A1, A).should.be.equal(true, "A1 should inherits from A");
    mixin(B1, [A1, C]).should.be.equal(true, 'mixin');
    mCallOrder = [];
    const o = new B1();
    o.m("a", 12); // call chain: B1::m -> C::m -> Root::m
    Root.prototype.m.should.have.been.calledOnce;
    Root.prototype.m.should.have.been.calledWith("a", 12);
    mCallOrder.should.be.deep.equal(['B1', 'C', 'Root']);
  });
  it("should throw error when super function in a mixined class", function() {
    class A {
      m() {
        return super.m();
      }

    };
    function B() {};
    expect(mixin.bind(null, B, A, {
      filter: mixin.filterOpts.errSuper
    })).to.throw('method: should not use super');
  });
  it("should throw error when filter option value error in a mixined class", function() {
    class A {
      m() {
        return super.m();
      }

    };
    function B() {};
    return expect(mixin.bind(null, B, A, {
      filter: 9999
    })).to.throw('filter option value error');
  });
  it("should skip super method when super function in a mixined class", function() {
    class A {
      m() {
        return super.m();
      }

      m1() {}

    };
    function B() {};
    mixin(B, A, {
      filter: mixin.filterOpts.skipSuper
    }).should.be.equal(true, 'mixin');
    B.prototype.should.have.not.property('m');
    B.prototype.should.have.property('m1');
  });
  it("should allow properties in the filter array only in a mixined class", function() {
    class A {
      m() {}

      m1() {}

    };

    A.prototype.nosuch = 1;

    A.prototype.got = 2;

    function B() {};
    mixin(B, A, {
      filter: ['m', 'got']
    }).should.be.equal(true, 'mixin');
    B.prototype.should.have.not.property('m1');
    B.prototype.should.have.not.property('nosuch');
    B.prototype.should.have.property('m');
    B.prototype.should.have.property('got');
  });
  it("should call super function in a mixined class and no recursive in itself", function() {
    let mCallOrder = [];

    class A {
      m() {
        mCallOrder.push('A');
        // return super.m()
        // return getSuperProto(this).m.apply(this);
      }
    };
    function B() {};
    class B1 extends B{
      m() {
        mCallOrder.push('B1');
        return super.m()
        // return getSuperProto(this).m.apply(this);
      }
    };
    // inherits(B1, B).should.be.equal(true, "B1 should inherits from B");
    mixin(B1, A).should.be.equal(true, 'mixin');
    mCallOrder = [];
    let o = new B1();
    o.m("a", 12); // call chain:  B1::m -> A::m
    mCallOrder.should.be.deep.equal(['B1', 'A']);
  });
  it("should call super function in a mixined class and no mixined method in itself", function() {
    let mCallOrder = [];
    function Root() {};

    Root.prototype.m = sinon.spy(function() {
      mCallOrder.push('Root');
    });

    class C {
      m() {
        mCallOrder.push('C');
        super.m(...arguments);
      }

    };
    class A {
      m() {
        mCallOrder.push('A');
        super.m(...arguments);
      }

    };
    class A1 {
      m() {
        mCallOrder.push('A1');
        super.m(...arguments)
      }

    };
    function B() {};
    function B1() {};
    inherits(C, Root).should.be.equal(true, "C should inherits from Root");
    inherits(B1, B).should.be.equal(true, "B1 should inherits from B");
    inherits(A1, [A, Root]).should.be.equal(true, "A1 should inherits from A");
    mixin(B1, A1).should.be.equal(true, 'mixin');
    mCallOrder = [];

    let o = new B1();
    o.m("a", 12); // call chain:  A1::m -> A::m
    mCallOrder.should.be.deep.equal(['A1', 'A', 'Root']);
    mCallOrder = [];
    mixin(B1, C).should.be.equal(true, 'mixin');
    mixin(B1, [A1, C]).should.be.equal(false, 'dup mixin');
    mixin(B1, A1).should.be.equal(false, 'dup mixin A1');
    mixin(B1, C).should.be.equal(false, 'dup mixin C');
    // log(getProtoChain(B1))
    o = new B1();
    o.m("a", 12); // call chain:  C::m -> Root::m
    mCallOrder.should.be.deep.equal(['C', 'Root']);
    Root.prototype.m.should.have.been.calledTwice;
    Root.prototype.m.should.have.been.calledWith('a', 12);
  });
});
