'use strict';

const assert = require(`chai`).assert;
const fs = require(`mz/fs`);
const transform = require(`../../../src/transform`);

describe(`fs`, () => {
  beforeEach(() => eval(transform(`
    sh("rm -f out.json")
    sh("rm -f out.txt")
  `)));

  describe(`readFile()`, () => {
    it(`defaults to utf8 encoding`, () => {
      const code = transform(`
        writeFile("out.json", JSON.stringify({proof: true}));
        return readFile("out.json");
      `);

      return assert.becomes(eval(code), `{"proof":true}`);
    });
  });

  describe(`readJSON()`, () => {
    it(`reads and parses JSON files`, () => {
      const code = transform(`
        writeFile("out.json", JSON.stringify({proof: true}));
        return readJSON("out.json");
      `);

      return assert.becomes(eval(code), {proof: true});
    });
  });

  describe(`writeFile()`, () => {
    it(`writes a file`, () => {
      const code = transform(`
        writeFile("out.txt", "proof");
      `);

      return assert.isFulfilled(eval(code))
        .then(() => assert.becomes(fs.readFile(`out.txt`, `utf8`), `proof`));
    });
  });

  describe(`mkdir()`, () => {
    beforeEach(() => eval(transform(`
      sh("rm -rf test1/test2/test3")
    `)));

    it(`automatically behaves like mkdirp`, () => {
      const code = transform(`
        mkdir("test1/test2/test3");
      `);

      return assert.isFulfilled(eval(code));
    });
  });
});
