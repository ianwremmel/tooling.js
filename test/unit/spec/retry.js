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

  it(`defaults to three retries if no options are specified`, () => {
    const spy = sinon.spy();
    const code = transform(`
      retry(
        new Promise((resolve, reject) => {
          spy();
          reject(new Error('expected failure'));
        })
      )
    `);

    return assert.isRejected(eval(code), /expected failure/)
      .then(() => assert.callCount(spy, 3));
  });

  it(`retries synchronous failures`, () => {
    const spy = sinon.spy();
    const code = transform(`
      retry(
        (function() {
          spy();
          throw new Error('expected failure')
        })
      )
    `);

    return assert.isRejected(eval(code), /expected failure/)
      .then(() => assert.callCount(spy, 3));
  });

  it(`auto-invokes arrow expressions`, () => {
    const spy = sinon.spy();
    const code = transform(`
      retry(
        (() => {
          spy();
          throw new Error('expected failure')
        })
      )
    `);

    return assert.isRejected(eval(code), /expected failure/)
      .then(() => assert.callCount(spy, 3));
  });

  it(`auto-invokes function expressions`, () => {
    const spy = sinon.spy();
    const code = transform(`
      retry(
        (function() {
          spy();
          throw new Error('expected failure')
        })
      )
    `);

    return assert.isRejected(eval(code), /expected failure/)
      .then(() => assert.callCount(spy, 3));
  });

  it(`injects the ITERATION, MAX_ITERATIONS into the loop`);
});
