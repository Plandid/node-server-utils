#! /usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const process = require('process');

var packageJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'package.json'))
);

execSync('git tag ' + packageJson.version);