const assert = require('assert')
// import sinon from 'sinon'
const extend = require('../src/extend')

describe('extend', () => {
  it('should extend the target ctor', () => {
    class Target {}
    class Source {m(){}}
    class Source2 {n(){}}
    const result = extend(Target, Source, Source2)
    assert.strictEqual(result, Target)
    assert.deepStrictEqual(Object.getOwnPropertyNames(result.prototype),
      ['constructor','m', 'n'])
    assert.strictEqual(result.prototype.constructor, Target)
    assert.strictEqual(result.prototype.m, Source.prototype.m)
    assert.strictEqual(result.prototype.n, Source2.prototype.n)
  });

});
