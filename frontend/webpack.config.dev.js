const path = require('path');

const OUTPUT_PATH = path.resolve(__dirname, 'build_dev');

module.exports = {
  mode: 'development',
  entry: './src/app.ts',
  output: {
    path: OUTPUT_PATH,
    filename: 'pxeditor.dev.js'
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [{
          loader: 'ts-loader',
        }],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { url: false }
          }
        ]
      }
    ]
  },
  devServer: {
    contentBase: OUTPUT_PATH,
    contentBasePublicPath: '/',
    watchContentBase: true,
    open: true
  }
};
