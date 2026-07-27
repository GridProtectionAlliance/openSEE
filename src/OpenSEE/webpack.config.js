"use strict";
const path = require("path");
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
var webpack = require('webpack');

function buildConfig(env, argv) {
    if (env.NODE_ENV == undefined) env.NODE_ENV = 'development';

    let config = {
        mode: env.NODE_ENV,
        context: path.resolve(__dirname),
        cache: true,
        entry: {
            OpenSee: "./wwwroot/Scripts/TSX/OpenSee.tsx"
        },
        output: {
            path: path.resolve(__dirname, './wwwroot/Scripts'),
            filename: "[name].js",
        },
        // Enable sourcemaps for debugging webpack's output.
        devtool: "inline-source-map",
        resolve: {
            // Add '.ts' and '.tsx' as resolvable extensions.
            extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".css"]
        },
        module: {
            rules: [
                // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
                {
                    test: /\.tsx?$/,
                    include: path.resolve(__dirname, 'wwwroot', "Scripts"),
                    loader: "ts-loader", options: { transpileOnly: true }
                },
                {
                    test: /\.css$/,
                    use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
                },
                //{
                //    test: /\.js$/,
                //    enforce: "pre",
                //    loader: "source-map-loader"
                //},
                {
                    //loader is the default asset loader in webpack 5
                    test: /\.(woff|woff2|ttf|eot|svg|png|gif)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    type: 'asset',
                    parser: { dataUrlCondition: { maxSize: 100000 } }
                }
            ]
        },
        externals: {
        },
        optimization: {
            minimizer: [
                new TerserPlugin({ extractComments: false })
            ],
        },
        plugins: [
            new ForkTsCheckerWebpackPlugin(),
            new webpack.ProvidePlugin({
                $: "jquery",
                "window.jQuery": "jquery",
            })
        ]
    };

    if (argv.mode == 'production') {
        config.mode = argv.mode;
        config.devtool = "eval";
    }

    return config;
}


module.exports = buildConfig;