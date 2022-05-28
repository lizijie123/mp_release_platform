const webpack = require('webpack')
const webpackMerge = require('webpack-merge')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const nodeExternals = require('webpack-node-externals')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const webpackBaseConfig = require('./webpack.base.config')
const { ENV } = require('../lib/constants')

const config = {
  target: 'node',
  entry: ENV.PATHS.SERVER_ENTRY,
  output: {
    filename: 'server-bundle.js',
    libraryTarget: 'commonjs2',
  },
  optimization: {
    splitChunks: false,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/env',
                {
                  useBuiltIns: 'usage',
                  corejs: 3,
                },
              ],
            ],
            plugins: [
              [
                'component',
                {
                  libraryName: 'element-ui',
                  styleLibraryName: 'theme-chalk',
                },
              ],
            ],
          },
        }],
        include: /app/i,
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  autoprefixer,
                ].concat(ENV.PRODUCTION ? [
                  cssnano,
                ] : []),
              },
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  autoprefixer,
                ].concat(ENV.PRODUCTION ? [
                  cssnano,
                ] : []),
              },
            },
          },
          'sass-loader',
          {
            loader: 'sass-resources-loader',
            options: {
              resources: ENV.PUBLIC_SCSS,
            },
          },
        ],
        include: /app/i,
        exclude: /node_modules/,
      },
    ],
  },
  externals: nodeExternals({
    allowlist: [/\.css$/, /ant-design-vue\/lib/],
  }),
  plugins: [
    new webpack.DefinePlugin({
      __CLIENT__: false,
      __SERVER__: true,
    }),
    new VueSSRServerPlugin(),
  ],
}

module.exports = webpackMerge.merge(webpackBaseConfig, config)
