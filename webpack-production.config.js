var webpack = require('webpack')
var WebpackStripLoader = require('strip-loader')
var devConfig = require('./webpack.config.js')

var stripLoader = {
  test: [/\.js$/, /\.es6$/],
  exclude: /node_modules/,
  loader: WebpackStripLoader.loader('console.log')
}
devConfig.module.loaders.push(stripLoader)

var prodPlugins = [
  new webpack.optimize.DedupePlugin(),
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  })
]

devConfig.plugins.concat(prodPlugins)

module.exports = devConfig
