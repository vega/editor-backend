const path = require('path')
const dotenv = require('dotenv')
const nodeExternals = require('webpack-node-externals')

dotenv.config()

module.exports = {
  mode: process.env.NODE_ENV,
  entry: './src/index.ts',
  target: 'node',
  devtool: 'inline-source-map',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.ts', '.js',], //resolve all the modules other than index.ts
  },
  externals: [nodeExternals(),],
  module: {
    rules: [
      {
        use: 'ts-loader',
        test: /\.ts?$/,
      },
    ],
  },
}