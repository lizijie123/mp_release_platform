const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const utils = require('../lib/utils')
const { ENV } = require('../lib/constants')

const config = {
  output: {
    filename: 'js/[name].[hash].js',
    path: ENV.PATHS.CLIENT_OUTPUT,
    publicPath: ENV.PATHS.PUBLIC_PATH,
    chunkFilename: 'js/[name].[chunkhash].chunk.js',
  },
  mode: ENV.NODE_ENV,
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: ['vue-loader'],
        include: /app/i,
        exclude: /node_modules/,
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: 'font/[name].[hash].[ext]',
          },
        }],
        // include: /app/i,
        // exclude: /node_modules/,
      },
      {
        test: /\.(png|jpg|gif|jpeg)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 1024,
            name: 'image/[name].[ext]',
          },
        }],
        include: /app/i,
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      __PRODUCTION__: ENV.PRODUCTION,
      __DEVELOPMENT__: ENV.DEVELOPMENT,
      'process.env.HTTPPORT': `${process.env.HTTPPORT || 8088}`,
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: utils.fixedToRelativePath('./view/index.html'),
      minify: {
        removeComments: false,
        collapseWhitespace: ENV.PRODUCTION,
        minifyCSS: ENV.PRODUCTION,
      },
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js', '.json', '.scss', '.css', '.vue'],
    alias: {
      '@': utils.fixedToRelativePath('/app'),
      '@assets': utils.fixedToRelativePath('/app/assets'),
      '@images': utils.fixedToRelativePath('/app/assets/images'),
      '@scss': utils.fixedToRelativePath('/app/assets/scss'),
      '@components': utils.fixedToRelativePath('/app/components'),
      '@lib': utils.fixedToRelativePath('/app/lib'),
      '@filter': utils.fixedToRelativePath('/app/filter'),
      '@mixin': utils.fixedToRelativePath('/app/mixin'),
      '@router': utils.fixedToRelativePath('/app/router'),
      '@src': utils.fixedToRelativePath('/app/src'),
      '@store': utils.fixedToRelativePath('/app/store'),
      '@utils': utils.fixedToRelativePath('/app/utils'),
    },
  },
  devtool: ENV.DEVELOPMENT ? 'cheap-module-eval-source-map' : 'none',
}

module.exports = config
