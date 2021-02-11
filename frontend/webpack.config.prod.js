const path = require('path');

const OUTPUT_PATH = path.resolve(__dirname, '..', 'backend', 'static', 'js');

module.exports = {
  mode: 'production',
  entry: './src/app.ts',
  output: {
    path: OUTPUT_PATH,
    filename: 'pxeditor.js'
  },
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
  }
};
