import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import pkg from './package.json' with {type: 'json'}
import copy from "rollup-plugin-copy";

const commonExternal = [
    ...(pkg.dependencies ? Object.keys(pkg.dependencies) : []),
    ...(pkg.peerDependencies ? Object.keys(pkg.peerDependencies) : []),
    ...(pkg.devDependencies ? Object.keys(pkg.devDependencies) : [])
]

export default {
    input: 'src/server/server.tsx',
    output: {
        file: 'dist/server.mjs',
        format: 'es',
        sourcemap: true
    },
    external: commonExternal,
    plugins: [
        nodeResolve(),
        commonjs(),
        typescript({
            outputToFilesystem: true,
            exclude: ["**/client/**"]
        }),
        json(),
        copy({
            targets: [
                {src: 'src/server/templates', dest: 'dist'}
            ]
        })
    ]
}
