# Inherits-Ex [![npm](https://img.shields.io/npm/v/inherits-ex.svg)](https://npmjs.org/package/inherits-ex)

[![Join the chat at https://gitter.im/snowyu/inherits-ex.js](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/snowyu/inherits-ex.js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://img.shields.io/travis/snowyu/inherits-ex.js/master.png)](http://travis-ci.org/snowyu/inherits-ex.js)
[![Code Climate](https://codeclimate.com/github/snowyu/inherits-ex.js/badges/gpa.svg)](https://codeclimate.com/github/snowyu/inherits-ex.js)
[![Test Coverage](https://codeclimate.com/github/snowyu/inherits-ex.js/badges/coverage.svg)](https://codeclimate.com/github/snowyu/inherits-ex.js/coverage)
[![downloads](https://img.shields.io/npm/dm/inherits-ex.svg)](https://npmjs.org/package/inherits-ex)
[![license](https://img.shields.io/npm/l/inherits-ex.svg)](https://npmjs.org/package/inherits-ex)

Browser-friendly enhanced inheritance fully compatible with standard node.js
[inherits](http://nodejs.org/api/util.html#util_util_inherits_constructor_superconstructor)
with dynamic inheritance or creation.

This package modifies and enhances the standard `inherits` from node.js
`util` module in node environment. It also has a shim for old
browsers with no `Object.create` support.

Differs from the standard implementation is:

+ Static inheritance
+ Multi-inheritances(inheritance chain) supports
+ Mixin-inheritances(inheritance chain) supports
+ Inherits at anytime.
  * you can not declare method/property before inherits in the standard way for it will replace the prototype object.
+ Duplication inheritance check
+ Es6 Class supports
+ Coffee-script supports
+ More helper functions
  * `isInheritedFrom(ctor, superCtor|superCtorName)` Check the ctor whether inherited from superCtor
  * `mixin(ctor, superCtor|superCtor[])` Mixin the methods and properties of the SuperCtor:
    * Clone(Copy) all superCtor's properties(methods) to ctor.
  * `isMixinedFrom(ctor, superCtor|superCtorName)` Whether mixined from superCtor
  * `createCtor(name, args, body)` Create Ctor(Class) dynamically
  * `createObject(ctor, args...)` Create Object instance dynamically
  * `createFunction(name, [args,] body[, scope[, values]])` Create Function dynamically
  * ...

The standard `inherits` implementation is in `inherits-ex/lib/inheritsDirectly`,
of cause it's the coffee-script supports and browser-friendly.

## API

Full API see the folder: [docs](docs/modules.md)

### inherits

`function inherits(ctor, superCtor|superCtor[], staticInherit = true): boolean`

A powerful tool for implementing class inheritance that supports dynamic inheritance and multiple inheritance.

**Features**:

* Supports dynamic inheritance.
  * inherits at anytime.
  * you can not declare method/property before inherits in the standard way for it will replace the prototype object.
* Multi-inheritances(inheritance chain) supports
* Preserves existing methods and properties in the child class's prototype instead of overwriting them.
* Avoids circular dependencies by checking if the parent class has already inherited from the child class.
* Avoids duplicate inheritance by checking if the child class has already inherited from the parent class.
* Supports multiple inheritance by allowing an array of parent classes to be passed in.
* Optional static members inheritance.
  * Argument `staticInherit` (*boolean*): whether static inheritance,defaults to true.

The function is compatible with both ES5 and ES6, as well as older browsers that do not support these
versions of JavaScript. The function also supports CoffeeScript-generated classes.

```js
const inherits = require('inherits-ex/lib/inherits')
```

**Note**:

* When using the `inherits` function, two properties, `super_` and `__super__`, are added to the constructor function (`ctor`).
  * The `super_` property refers to the parent constructor.
  * The `__super__` property refers to the parent's prototype object, which can be used for the `super` keyword in CoffeeScript.
* In addition, the `Class` property is added to the prototype object of the constructor function (`ctor`).
  * This property points to the current class(`ctor`).
  * This property can also be accessed by instances of the class.
  * It is important to note that for the empty constructor, the instance of `ctor` may not be the current class, but the `Class` property is always set to the current class for instance.

#### Known Issues

The default constructor chain in ES6 Class may fail if the constructor is empty, because the constructor cannot be directly called if the `Reflect.construct(target, args, newTarget)` native method is not supported. In such a case, you may need to manually define a constructor or use a polyfill to support the `Reflect.construct()` method.


```javascript
const inherits = require('inherits-ex/lib/inherits')
const getPrototypeOf = require('inherits-ex/lib/getPrototypeOf')
const defineProperty = require('inherits-ex/lib/defineProperty')

// Or use function class instead of ES6 class:
// function Root() {this.initialize.apply(this, arguments)}
// Root.prototype.initialize = function initialize() {console.log('Root.init')}
class Root {
  constructor() {
    this.initialize.apply(this, arguments)
  }
  initialize() {
    console.log('Root.init')
  }
}

class A {
  /*
    If you encounter issues with the inherits function and the default constructor chain in ES6 class, you may need to add a constructor function to the derived class in order to call the parent constructor. Alternatively, you can use the traditional function syntax to define your classes and implement inheritance, rather than the ES6 class syntax. For example, you can define a root function and a derived function using the traditional syntax, and then use the inherits function to implement inheritance between them. This way, you can avoid the issue of needing to define a constructor in the derived class.
   */
  constructor() {
    // this `Class` prop is only created by the `inherits` function or `newPrototype` function.
    if (!this.Class) {
      const proto = getPrototypeOf(this)
      const cls = proto.constructor
      defineProperty(this, 'Class', cls)
      if (!cls.__super__) defineProperty(cls, '__super__', getPrototypeOf(proto))
    }
    const Parent = getParentClass(this.Class)
    // create the instance by calling the parent constructor
    return Reflect.construct(Parent, arguments, this.Class)
    // or call initialize method directly
    // this.initialize.apply(this, arguments)
  }

  initialize() {
    const ParentPrototype = this.Class.__super__
    ParentPrototype.init.apply(this, arguments)
    console.log('A.init')
  }
}

inherits(A, Root)

const obj = new A() // Bug: The initialize method can not be executed.
```

#### Usage

```javascript
const assert = require('assert')
const inherits = require('inherits-ex/lib/inherits')
const isInheritedFrom = require('inherits-ex/lib/isInheritedFrom')
const getParentClass = require('inherits-ex/lib/getParentClass')
const log = console.log.bind console

function getSuper(obj) {
  return getParentClass(obj).prototype
}

class Root{
  m() {log('root')}
}

class A{
  m(){
    log('A')
    getSuper(this).m.call(this)
    // super.m()
  }
}
inherits(A, Root)

class B {
  m() {
    log('B')
    getSuper(this).m.call(this)
    // super.m()
  }
}
inherits(B, Root)


class MyClass {
}

// MyClass -> A -> Root
inherits(MyClass, B)
// MyClass -> A -> B -> Root
inherits(MyClass, A)

// duplication inheritances prohibited.
assert.notOk(inherits(A, Root))
assert.ok(isInheritedFrom(MyClass, A))
assert.ok(isInheritedFrom(MyClass, Root))
assert.ok(isInheritedFrom(MyClass, B))

```

and the following codes do same thing:

```javascript
class Root {
  static static = 1
  m() {log('root')}
}

class A {
  m() {
    log('A')
    super.m()
  }
}

class B {
  m() {
    log('B')
    super.m()
  }
}

class MyClass {
}

// Create inheritances chain: MyClass -> A -> B -> Root
inherits(MyClass, [A, B, Root])

assert.ok(isInheritedFrom(MyClass, A))
assert.ok(isInheritedFrom(MyClass, Root))
assert.ok(isInheritedFrom(MyClass, B))
assert.equal(MyClass.static, 1)
```

### inheritsDirectly

Enables dynamic prototypal inheritance between classes, allowing for flexible and reusable code.

`inheritsDirectly(ctor:Function, superCtor:Function, staticInherit = true)`

* `staticInherit` (*boolean*): whether static inheritance,defaults to true.

```js
  var inheritsDirectly = require('inherits-ex/lib/inheritsDirectly')
```

The `inheritsDirectly` function is compatible with both ES5 and ES6, as well as older browsers that do not support these versions of JavaScript.
The function also supports CoffeeScript-generated classes

**Note**: If a parent class already exists on the class, it will be replaced by the new parent class.

### isInheritedFrom

Determines if a constructor(class) is inherited from a given super constructor(class).

`isInheritedFrom(ctor, superCtor|superCtorName, raiseError=false)`

```js
  var isInheritedFrom = require('inherits-ex/lib/isInheritedFrom')
```

return the superCtor's son if ctor is inherited from superCtor.
else return false.

it will use the ctor.name to check whether inherited from superCtorName.

### mixin

`mixin(ctor:Function, superCtor:Function|Function[], options:{ filter: number|function})`

Mixin the methods and properties of the SuperCtor: Clone(Copy) all `superCtor`'s properties(methods) to ctor.

Mixes the methods and properties from one or more classes to the target class.

By default, all properties and methods from the `superCtors` will be cloned into the internal `mixinCtor_`
constructor of the target class(`ctor`). This can be customized by providing the `options.filter` parameter.

If the target class does not already have a `mixinCtor_` constructor it'll create the new constructor
`mixinCtor_` which is then inherited by the `ctor`(target class). The `mixinCtor_` is also set as a property of the
`ctor`.


* options:
  * filter: defaults to 0.
    * `0`: copy all properties(methods)
    * `1`: raise error if found a method using `super`
    * `2`: skip these methods which using `super`
    * `string[]`: only name in the array of string will be copied.
    * `function(name, value){return value}` the callback function of filter.
      * `name`: the property name
      * `value`: the property value.

```js
  var mixin = require('inherits-ex/lib/mixin')
```

mixin all superCtors to ctor.

* Duplication mixin or inheritance check
* **NOTE:**:the methods in mixins using `super()` will jump to the old class(not stay on the class).
* The mixined properties(methods) are cloned(copied) from superCtors(includes the static members)
* The all mixined properties(methods) are the first parent's ctor(`MixinCtor_`)
  * eg, `ctor -> MixinCtor_ -> original parents`

```javascript
const mCallOrder = []
class Root {}

class C extends Root {
  m() {
    mCallOrder.push('C')
    super()
  }
}

class A {
  m() {
    mCallOrder.push('A')
  }
}

class A1 extends A {
  m() {
    mCallOrder.push('A1')
    super()
  }
}

class B {}
inherits(B, Root)

class B1 extends B {
  m() {
    mCallOrder.push('B1')
    super()
  }
}

mixin(B1, [A1, C]).should.be.equal(true, 'mixin')
const o = new B1()
o.m("a", 12) // call chain: B1::m -> C::m
A::m.should.have.been.calledOnce
A::m.should.have.been.calledWith("a", 12)
mCallOrder.should.be.deep.equal(['B1', 'C'])
```

The inheritance chain: `B1 -> MixinCtor_ -> B -> Root`
All mixins will be added to `MixinCtor_`.

### isMixinedFrom

`isMixinedFrom(ctor: Function, superCtor: Function|string)`

Check if a constructor(`ctor`) is mixed from a specific constructor(`superCtor`).

```js
  var isMixinedFrom = require('inherits-ex/lib/isMixinedFrom')
```

### createCtor

`createCtor(name: string, args: Array|string, body: string|null|undefined): Function`

Create a constructor(class) dynamically.

* Creates a constructor function dynamically with the given name, arguments, and body.
* If the arguments are a string, it is assumed to be the body and the arguments are set to an empty array.
* If the body is null or undefined, a default body is created that calls the parent constructor.


* `name`(*string*): the class name
* `args`(*any[]*): the optional constructor's args.
* `body`(*string*): the optional constructor function body.

```js
  const createClass = require('inherits-ex/lib/createCtor')
  const MyClass = createClass('MyClass', ['a', 'b'], 'this.sum = a + b');
  var my = new MyClass(1, 2);
  console.log(my.sum);
```

### createObject

`createObject(ctor: Function, ...args)`

The helper function to create the object dynamically and arguments provided individually.

```js
  var createObject = require('inherits-ex/lib/createObject')
  class MyClass {
    constructor(a,b) {
      this.sum = a + b;
    }
  }
  var o = createObject(MyClass, 1, 2)
  console.log(o.sum)
```

NOTE: It will call the parent constructor if the class is the Empty constructor.

```javascript
var inherits        = require('inherits-ex/lib/inherits')
var createObject    = require('inherits-ex/lib/createObject')

class Root {
  constructor() {
    this.init = 'root'
  }
}

class MyClass {
}

inherits(MyClass, Root)

var obj = createObject(MyClass)
assert.equal(obj.init, 'root')
```

Usage:

```javascript
class RefObject {
  constructor() {this.initialize.apply(this, arguments)}
}
class MyObject {
  initialize(a, b) {
    this.a = a
    this.b = b
  }
}
inherits(MyObject, RefObject)

obj = createObject(MyObject, "a", "b")
// obj = new MyObject("a", "b") // it will have no property a and b.
assert.equal(obj.a, "a")
assert.equal(obj.b, "b")
```

### createObjectWith

`createObjectWith(ctor, args: Array)`

The helper function to create the object dynamically. provides the arguments as an array (or an array-like object).

```js
var createObjectWith = require('inherits-ex/lib/createObjectWith')
var obj = createObjectWith(MyObject, ['a', 'b'])
```

NOTE: It will call the parent constructor if the class is the Empty constructor.

### createFunction

`createFunction(name: string, [args,] body[, scope[, values]])`

* arguments:
  * `name` *(String)*: the function name
  * `args` *(Array)*: the function argument list. it's optional.
  * `body` *(String)*: the function body.
  * ``scope` *(Object|Array)*: the optional function scope.
    * ignore the `values`  if it's an object.
    * the `value` is required if it's an array. It's the key's name list
  * `value` *(Array)*: the optional function scope's value list. only for the `scope` is the Array.

The helper function to create the function dynamically.

```js
  var createFunction = require('inherits-ex/lib/createFunction')
```
