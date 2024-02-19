"use strict";
const path = require("path");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

function buildConfig(env, argv) {
    if (env.NODE_ENV == undefined) env.NODE_ENV = 'development';

    let config = {
        mode: env.NODE_ENV,
        context: path.resolve(__dirname),
        cache: true,
        entry: {
            OpenSee: "./Scripts/TSX/OpenSee.tsx",
            ToolTipDeltaWidget: "./Scripts/TSX/jQueryUI Widgets/TooltipWithDelta.tsx",
            ToolTipWidget: "./Scripts/TSX/jQueryUI Widgets/Tooltip.tsx",
            TimeCorrelatedSagsWidget: "./Scripts/TSX/jQueryUI Widgets/TimeCorrelatedSags.tsx",
            PointWidget: "./Scripts/TSX/jQueryUI Widgets/AccumulatedPoints.tsx",
            PhasorChartWidget: "./Scripts/TSX/jQueryUI Widgets/PhasorChart.tsx",
            ScalarStatsWidget: "./Scripts/TSX/jQueryUI Widgets/ScalarStats.tsx",
            LightningDataWidget: "./Scripts/TSX/jQueryUI Widgets/LightningData.tsx",
            SettingsWidget: "./Scripts/TSX/jQueryUI Widgets/SettingWindow.tsx",
            FFTTable: "./Scripts/TSX/jQueryUI Widgets/FFTTable.tsx",
            HarmonicStatsWidget: "./Scripts/TSX/jQueryUI Widgets/HarmonicStats.tsx",
        },
        output: {
            path: path.resolve(__dirname, 'Scripts'),
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
                    include: path.resolve(__dirname, "Scripts"),
                    loader: "ts-loader", options: { transpileOnly: true }
                },
                {
                    test: /\.css$/,
                    include: path.resolve(__dirname, 'wwwroot', "Content"),
                    use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
                },
                //{
                //    test: /\.js$/,
                //    enforce: "pre",
                //    loader: "source-map-loader"
                //},
                { test: /\.(woff|woff2|ttf|eot|svg|png|gif)(\?v=[0-9]\.[0-9]\.[0-9])?$/,loader:'url-loader', options: { limit:100000 } }
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
            new NodePolyfillPlugin(),
            new ForkTsCheckerWebpackPlugin()
        ]
    };

    if (argv.mode == 'production') {
        config.mode = argv.mode;
        config.devtool = "";
    }
   
    return config;
}


module.exports = buildConfig;