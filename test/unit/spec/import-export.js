'use strict';

const assert = require(`chai`).assert;
const transform = require(`../../../src/transform`);

describe(`esnext`, () => {
  it(`handles esnext imports`, () => {
    const code = transform(`
      import fs from 'fs';
      echo('success')
    `);

    return assert.isFulfilled(eval(code));
  });

  it(`handles multiline esnext imports`, () => {
    const code = transform(`
      import {
        readFile
      } from 'fs';
      echo('success')
    `);

    return assert.isFulfilled(eval(code));
  });
});
