#!/usr/bin/env node
import {transform} from 'babel-core';
import fs from 'fs';

const source = `require('shelljs/global'); (async function() {${fs.readFileSync(process.argv[2])}}())`;

const {code, map, ast} = transform(source, {
  plugins: [
    'transform-runtime'
  ],
  presets: [
    ['env', {
      targets: {
        node: true
      }
    }]
  ]
});

eval(code);
