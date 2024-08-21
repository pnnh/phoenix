import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

export default {
    input: 'main.ts',
    output: {
        file: 'dist/main.js',
        format: 'cjs',
        sourcemap: true
    },
    external: [
        'next', 'react', 'react-dom', 'sharp', 'sqlite3'
    ],
    plugins: [typescript({
        exclude: ["src"],
        outputToFilesystem: true
    }),
    commonjs(),
    json(),
    nodeResolve({
        preferBuiltins: true
    })]
}
