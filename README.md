# tooling.js _(@ianwremmel/tooling.js)_

[![CircleCI](https://img.shields.io/circleci/project/github/ianwremmel/tooling.js.svg?style=flat-square)](https://circleci.com/gh/ianwremmel/tooling.js/tree/master)
[![npm (scoped)](https://img.shields.io/npm/v/@ianwremmel/tooling.js.svg?style=flat-square)](https://www.npmjs.com/package/@ianwremmel/tooling.js)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> tooling.js makes it easier to use nodejs for automation tasks.

Inspired by [Jenkins Pipelines](https://jenkins.io/doc/book/pipeline/) (specifically, the [groovy]() based Jenkinsfile), tooling.js aims to make JavaScript friendlier for writing tooling for software projects.

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Roadmap](#roadmap)
- [Contribute](#contribute)
- [License](#license)

## Background

Bash is clearly the defacto interpreter for the tasks required for building and testing software projects. However, as projects grow in size, bash can start to get unwieldy: error handling is complex, everything is in global scope, and parallelism requires arcane syntax and dropping state into tmp files.

JavaScript (especially with async/await), on the other hand, makes parallism and error handling loads better than bash. `try/catch` makes error handling reasonable straightforward (certainly easier than spending ten minutes on stack overflow to figure out if you should use `==` or `-eq`).

Of course, to take advantage of some of the most convenient advantes of JavaScript, we need to introduce babel and its requisite plugins - which is fine, but not work that we should repeat in every project we write. Enter tooling.js.

Tooling.js accepts a script file as an argument and passes it through two compilation stages. The second stage simply uses [`babel-present-env`](https://github.com/babel/babel-preset-env) to ensure that all syntax is compatible with your local node version. The first stage introduces the globals described below.

## Install

```bash
npm install -g @ianwremmel/tooling.js
```

or

```bash
npm install --save-dev @ianwremmel/tooling.js
```

> with the save-dev option, you'll want to define your executables with npm scripts.

## Usage

Invoke tooling.js with

```bash
tooling.js automation.js
```

Note that in addition to inject the globals described below, tooling.js wraps your script in an async IIFE, thus allowing you to use the await keyword at the top level of your script.

### Examples

#### Run three grunt tasks in parallel

```javascript
parallel(
  sh(`grunt test:unit`),
  sh(`grunt test:node`),
  sh(`grunt test:automation`)
)
```

#### Handle failing shell scripts

```javascript
try {
  sh(`exit 1`)
}
catch (err) {
  if (err.code === 1) {
    echo(`yowzers`);
  }
  else {
    echo(`this should never be reached`);
  }
}
```

#### Handle shell scripts with meaningful error codes

```javascript
const result = sh(`exit $RANDOM`, {complex: true});
if (result.code === 1) {
  echo(`exit with one`)
}
else {
  echo(`did not exit with one`)
}
```


## API

### cd

Changes the current directory

```javascript
const os = require(`os`);
cd(os.tmpdir());
```

### echo

Shorthand for `console.log`.

```javascript
echo(`1`)
```

### parallel

Run multiple items in parallel. Note: every argument is wrapped in a promise, so arguments can be anything that can be passed to a function.

```javascript
parallel(
  console.log(1),
  new Promise((resolve) => {
    process.nextTick(() => {
      console.log(2);
      resolve();
    })
  }),
  console.log(3)
);
```

### retry

Execute an expression multiple times.

#### Options
- repeat: Boolean - if true, the expression will be executed max times, even if it succeeds. default: false
- max: Number - maximum number of iterations. default: 3

```javascript
retry(
  new Promise((resolve, reject) => {
    reject(new Error(`this will fail 3 times`));
  })
)
```

> Note: rejected Promises *must* be rejected with `Error` objects. This seems to have something to do with babel's async/await support.

```javascript
retry({max: 2, repeat: true}
  new Promise((resolve) => {
    console.log(`this will print twice`);
  })
)
```

The variables ITERATION and MAX_ITERATIONS are injected into the running expression.

```javascript
retry({max: 2, repeat: true}
  new Promise((resolve) => {
    console.log(`{ITERATION} out of ${MAX_ITERATIONS}`);
  })
)
```

> Note: `ITERATION` is zero-based, so will never equal `MAX_ITERATIONS`.

### sh

Execute a shell command "synchronously" (actually wraps `child_process.spawn` in a promise and drops an `await` in front of it).

```javascript
sh(`echo 1`)
```

```javascript
try {
  sh(`exit 5`);
}
catch(err) {
  require(`assert`).equal(err.code, 5);
}
```

```javascript
const one = sh(`echo 1`, {complex: true}).stdout;
```

# Roadmap

- parallel
  - support max concurrency
  - suppress errors (optional?)
  - figure out how to augment the babylon parser so that e.g. try/catch statements can be passed as arguments
- implement cwd
- implement env
- implement exit
- implement helpers for npm, docker, jenkins
- capture stdout/stderr
- accept script via pipe

## Contribute

PRs accepted. Please lint and test your code with `npm test`

## License
[MIT &copy; Ian W. Remmel](LICENSE)
