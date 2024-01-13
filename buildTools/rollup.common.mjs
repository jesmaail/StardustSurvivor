import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import serve from "rollup-plugin-serve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import moveAssets from "./plugins/moveAssetsPlugin.mjs";
import createIndexHtml from "./plugins/createIndexHtml.mjs";
import freeTexturePackerPhaserFix from "./plugins/freeTextPackerPhaserFix.mjs";

const GAME_NAME = "StardustSurvivor"
const TEXTURE_MAP_FILES = ["./dist/assets/img/sprite_atlas.json"]

export function getRollupConfig(isProd = true) {   
    return {
        // Entrypoint
        input: [
            "./src/Game.ts"
        ],

        output: {
            file: "./dist/game.js",
            name: GAME_NAME,
            format: "iife",
            sourcemap: !isProd
        },

        plugins: getRollupPlugins(isProd)
    }
}

function getRollupPlugins(isProd) {
    let plugins = [
        createIndexHtml(),
        moveAssets("./dist", "./assets"),
        freeTexturePackerPhaserFix(TEXTURE_MAP_FILES),

        replace(phaser3FeatureToggles(isProd)),

        nodeResolve({
            extensions: [ ".ts", ".tsx" ]
        }),

        // Convert the Phaser 3 CJS modules into a format Rollup can use
        commonjs({
            include: [
                "node_modules/eventemitter3/**",
                "node_modules/phaser/**"
            ],
            exclude: [ 
                "node_modules/phaser/src/polyfills/requestAnimationFrame.js",
                "node_modules/phaser/src/phaser-esm.js"
            ],
            sourceMap: !isProd,
            ignoreGlobal: true
        }),

        // https://github.com/rollup/plugins/tree/master/packages/typescript 
        typescript()
    ]

    appendPluginExtras(plugins, isProd)

    return plugins
}

function appendPluginExtras(plugins, isProd) {
    if(isProd) {
        // https://github.com/rollup/plugins/tree/master/packages/terser
        plugins.push(
            terser()
        )
        return plugins;
    }

    // https://www.npmjs.com/package/rollup-plugin-serve
    plugins.push(
        serve({
            open: true,
            contentBase: "dist",
            host: "localhost",
            port: 10001,
            headers: {
                "Access-Control-Allow-Origin": "*"
            }
        })
    )
}

function phaser3FeatureToggles(isProd) {
    // Defaults
    let canvasRenderer = true
    let webglRenderer = true
    let webglDebug = true
    let experimental = true
    let pluginCamera3D = false
    let plguinFbInstant = false
    let pluginFeatureSound = true

    if(isProd){
        webglDebug = false;
    }

    return {
        preventAssignment: true,
        "typeof CANVAS_RENDERER": JSON.stringify(canvasRenderer),
        "typeof WEBGL_RENDERER": JSON.stringify(webglRenderer),
        "typeof WEBGL_DEBUG": JSON.stringify(webglDebug),
        "typeof EXPERIMENTAL": JSON.stringify(experimental),
        "typeof PLUGIN_CAMERA3D": JSON.stringify(pluginCamera3D),
        "typeof PLUGIN_FBINSTANT": JSON.stringify(plguinFbInstant),
        "typeof FEATURE_SOUND": JSON.stringify(pluginFeatureSound)
    }
}
