module.exports = {
  entry: {
    javascript: './src/App.js',
    html: './index.html'
  },

  resolve: {
    extensions: ['', '.js', '.jsx', '.json']
  },

  output: {
    path: './build',
    filename: 'main.js'
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        query: {
          cacheDirectory: true,
          presets: ['react', 'es2015']
        },
        exclude: /node_modules/
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.html$/,
        loader: 'file?name=[name].[ext]'
      }
    ]
  },

  plugins: []
}
