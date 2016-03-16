module.exports = {
  entry: './src/App.js',

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
      }
    ]
  },

  plugins: []
}
