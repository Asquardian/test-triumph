// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: CC0-1.0

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'webcomp-boilerplate.min.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html', // Path to your template HTML file
      filename: 'index.html' // Output filename
    })
  ],
  module: {
    rules: [
      {
        test: /\.scss$/i,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader",
        ],
      },
    ],
  }
};
