// webpack.config.js
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
                test: /\.(woff)$/i,
                type: 'asset',
                /*parser: {
                    dataUrlCondition: {
                        maxSize: 50 * 1024
                    }
                },*/
                generator: {
                    filename: 'fonts/[name][ext]'
                }
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
