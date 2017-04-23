/*
 * This file is part of Webpack.
 *
 * (c) Yrgo, högre yrkesutbildning Göteborg.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const production = process.env.NODE_ENV === 'production';

const src = path.resolve(__dirname, 'src');
const dest = path.resolve(__dirname, 'build');

module.exports = {
  devtool: 'cheap-module-source-map',

  entry: []
    .concat(
      production
        ? []
        : ['react-hot-loader/patch', 'webpack-hot-middleware/client']
    )
    .concat([path.join(src, 'entry.js')]),

  output: {
    path: dest,
    publicPath: '/',
    filename: production ? '[hash:8].js' : 'bundle.js',
  },

  module: {
    // Loaders are triggered when an imported file matches a pattern
    // and then process that file according to the loader specified.
    rules: [
      {
        // Mathches all files that ends with .js
        test: /\.jsx?$/,
        use: [
          {
            // Transpile matching files with babel.
            loader: 'babel-loader',
          },
        ],
        // Ignore files from node_modules to avoid
        // transpiling packages that (probably)
        // already are transpiled.
        exclude: /(node_modules)/,
      },
      {
        test: /\.scss$/,
        use: production
          ? ExtractTextPlugin.extract({
              fallback: 'style-loader',
              use: ['css-loader', 'sass-loader'],
            })
          : ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(production ? 'production' : 'development'),
      },
    }),
    new HtmlWebpackPlugin({
      template: path.join(src, 'templates', 'index.html'),
    }),
  ].concat(
    production
      ? [new ExtractTextPlugin('[contenthash:8].css')]
      : [new webpack.HotModuleReplacementPlugin()]
  ),
};
