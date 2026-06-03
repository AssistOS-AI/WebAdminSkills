#!/usr/bin/env node

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const testsDir = path.dirname(fileURLToPath(import.meta.url));

const child = spawn('node', ['--test', path.join(testsDir, '*.test.mjs')], {
    stdio: 'inherit',
    shell: true,
});

child.on('close', (code) => {
    process.exit(code);
});
