const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const DEV = process.env.NODE_ENV !== 'production';

module.exports = {
    mode: DEV ? 'development' : 'production',
    entry: './src/index.ts',
    devtool: DEV ? 'inline-source-map' : false,
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'plugin.user.js',
        // publicPath: '/assets/', // the url to the output directory resolved relative to the HTML page
    },
    resolve: {
        extensions: ['.js', '.ts']
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.ts$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true,
                    },
                }
            }
        ]
    },
    plugins: [
        new webpack.BannerPlugin({
            banner: fs.readFileSync(path.resolve(__dirname, './src/userscript.meta.js')).toString(),
            raw: true,
            entryOnly: true,
        }),
        new CopyWebpackPlugin([{from: path.resolve(__dirname, './src/userscript.meta.js'), to: path.resolve(__dirname, './dist/plugin.meta.js')}]),
        new ForkTsCheckerWebpackPlugin(),
    ]
}

