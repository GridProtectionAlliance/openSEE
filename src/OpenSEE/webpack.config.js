﻿"use strict";
const webpack = require("webpack");
const path = require("path");

function buildConfig(env, argv) {
    let config = {
        mode: 'development',
        context: path.resolve(__dirname, 'Scripts'),
        cache: true,
        entry: {
            OpenSee: "./TSX/OpenSee.tsx",
            ToolTipDeltaWidget: "./TSX/jQueryUI Widgets/TooltipWithDelta.tsx",
            ToolTipWidget: "./TSX/jQueryUI Widgets/Tooltip.tsx",
            TimeCorrelatedSagsWidget: "./TSX/jQueryUI Widgets/TimeCorrelatedSags.tsx",
            PointWidget: "./TSX/jQueryUI Widgets/AccumulatedPoints.tsx",
            PolarChartWidget: "./TSX/jQueryUI Widgets/PolarChart.tsx",
            ScalarStatsWidget: "./TSX/jQueryUI Widgets/ScalarStats.tsx",
            LightningDataWidget: "./TSX/jQueryUI Widgets/LightningData.tsx",
            SettingsWidget: "./TSX/jQueryUI Widgets/SettingWindow.tsx",
            FFTTable: "./TSX/jQueryUI Widgets/FFTTable.tsx",
            HarmonicStatsWidget: "./TSX/jQueryUI Widgets/HarmonicStats.tsx",
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
                { test: /\.tsx?$/, loader: "ts-loader" },
                {
                    test: /\.css$/,
                    loaders: ['style-loader', 'css-loader'],
                },
                {
                    test: /\.js$/,
                    enforce: "pre",
                    loader: "source-map-loader"
                },
                { test: /\.(woff|woff2|ttf|eot|svg|png|gif)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=100000" }
            ]
        },
        externals: {
            jquery: 'jQuery',
            react: 'React',
            'react-dom': 'ReactDOM',
            moment: 'moment',
            'react-router-dom': 'ReactRouterDOM',
        },
        plugins: [
            new webpack.ProvidePlugin({
                //$: 'jquery',
                //jQuery: 'jquery',
                //'window.jQuery':'jquery',
                //Map: 'core-js/es/map',
                //Set: 'core-js/es/set',
                //requestAnimationFrame: 'raf',
                //cancelAnimationFrame: ['raf', 'cancel'],
            }),
        ]
    };

    if (argv.mode == 'production') {
        config.mode = argv.mode;
        config.devtool = "";
    }
   
    return config;
}


module.exports = buildConfig;