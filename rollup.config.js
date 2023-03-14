import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default [{
    input: 'dist/sinclair.cjs.development.js',
    output:[
        {file: 'dist/bundle.js', format: 'cjs'},
    ],
    plugins: [
        resolve(),
        commonjs(),
    ]
}]
