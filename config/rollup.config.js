var nodeResolve = require('rollup-plugin-node-resolve');
var builtins = require('rollup-plugin-node-builtins');
var commonjs = require('rollup-plugin-commonjs');
var globals = require('rollup-plugin-node-globals');
var json = require('rollup-plugin-json');

var rollupConfig = {

    /**
     * entry: The bundle's starting point. This file will
     * be included, along with the minimum necessary code
     * from its dependencies
     */
    entry: process.env.IONIC_APP_ENTRY_POINT,

    /**
     * sourceMap: If true, a separate sourcemap file will
     * be created.
     */
    sourceMap: true,

    /**
     * format: The format of the generated bundle
     */
    format: 'iife',

    /**
     * dest: the output filename for the bundle in the buildDir
     */
    dest: process.env.IONIC_OUTPUT_JS_FILE_NAME,

    /**
     * MD5 error fix
     */
    useStrict: false,

    /**
     * plugins: Array of plugin objects, or a single plugin object.
     * See https://github.com/rollup/rollup/wiki/Plugins for more info.
     */
    plugins: [
        builtins(),
        json(),
        nodeResolve({
            main: true,
            module: true,
            jsnext: true,
            browser: true,
            extensions: ['.js', '.json']
        }),
        commonjs({
            namedExports: {
				// path to js-extend (npm 3.10.8)
                'node_modules/js-extend/extend.js': ['extend']
            }
        }),
        globals()
    ]
};

module.exports = rollupConfig;
