// webpack.config.js
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
        model: './src/model/index.ts',
        view: { import: './src/logical-view/index.ts', dependOn: 'model' },
        'physical': { import: './src/physical-view/index.ts', dependOn: ['model', 'view'] },
        demo: { import: './webpack-source/demo.ts', dependOn: ['model', 'view', 'physical'] }
    },     
    devServer: {
        static: './dist'
    },
    optimization: {
        runtimeChunk: 'single'
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'JMusic demo',
            template: './webpack-source/index.html'
        }),
        new CopyWebpackPlugin({
            patterns: [{ from: './webpack-source/fonts', to: 'fonts' }]
            
        }),
        new MiniCssExtractPlugin()
    ],
    output: { 
        filename: '[name].js',
        clean: true,        
        library: 'Utmila_[name]'
    },
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: [/node_modules/],
                use: 'ts-loader'
            },
            
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            }
        ]
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.html']
    }
};
