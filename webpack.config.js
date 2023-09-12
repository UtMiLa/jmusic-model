// webpack.config.js
const webpack = require('webpack');

module.exports = {
    entry: {
        model: './src/model/index.ts',
        view: { import: './src/logical-view/index.ts', dependOn: 'model' },
        'physical': { import: './src/physical-view/index.ts', dependOn: ['model', 'view'] }
    },
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
            }
        ]
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    }
};
