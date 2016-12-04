"use strict";

const assert = require(`chai`).assert;
const sinon = require(`sinon`);
const transform = require(`../../../src/transform`);

describe(`retry`, () => {
  it(`retries the specified action up to N times until it succeeds`, () => {
    const spy = sinon.spy();
    const code = transform(`
      retry({max: 3},
        new Promise((resolve, reject) => {
          spy();
          reject(new Error('expected failure'));
        })
      )
    `);

    return assert.isRejected(eval(code), /expected failure/)
      .then(() => assert.callCount(spy, 3));
  });

  it(`retries the specified action until it succeeds N times`, () => {
    const spy = sinon.spy();
    const code = transform(`
      retry({max: 3, repeat: true},
        new Promise((resolve, reject) => {
          spy();
          resolve();
        })
      )
    `);

    return assert.isFulfilled(eval(code))
      .then(() => assert.callCount(spy, 3));
  });

  it(`retries synchronous failures`);
  it(`injects the ITERATION, MAX_ITERATIONS into the loop`);
});
