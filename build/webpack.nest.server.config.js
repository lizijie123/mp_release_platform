const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const webpack = require('webpack')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const utils = require('../lib/utils')
const { ENV } = require('../lib/constants')

module.exports = function (options) {
  const newRules = [
    ...options.module.rules,
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
        },
      }],
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
            plugins: [
              autoprefixer,
            ].concat(ENV.PRODUCTION ? [
              cssnano,
            ] : []),
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
            plugins: [
              autoprefixer,
            ].concat(ENV.PRODUCTION ? [
              cssnano,
            ] : []),
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
    {
      test: /\.vue$/,
      use: ['vue-loader'],
      include: /app/i,
      exclude: /node_modules/,
    },
    {
      test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
      use: ['file-loader'],
      include: /app/i,
      exclude: /node_modules/,
    },
    {
      test: /\.(png|jpg|gif|jpeg)$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 1024,
        },
      }],
      include: /app/i,
      exclude: /node_modules/,
    },
  ]

  const newPlugins = [
    ...options.plugins,
    new webpack.DefinePlugin({
      __CLIENT__: false,
      __SERVER__: true,
      __PRODUCTION__: ENV.PRODUCTION,
      __DEVELOPMENT__: ENV.DEVELOPMENT,
      'process.env.NODE_ENV': `'${ENV.NODE_ENV || ENV.DEVELOPMENT}'`,
      'process.env.HTTPPORT': `${process.env.HTTPPORT || 8088}`,
      'process.env.HTTPSPORT': `${process.env.HTTPSPORT || 8089}`,
      'process.env.KEEP_ALIVE_TIMEOUT': `${process.env.KEEP_ALIVE_TIMEOUT || 10 * 1000}`,
      'process.env.NOT_HOT': `'${process.env.NOT_HOT || ''}'`,
    }),
    new VueLoaderPlugin(),
  ]
  const newOptions = {
    ...options,
    entry: {
      server: ENV.PATHS.NEST_SERVER_ENTRY,
    },
    output: {
      filename: '[name].js',
      path: ENV.PATHS.SERVER_OUTPUT,
    },
    module: {
      ...options.module,
      rules: newRules,
    },
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
    plugins: newPlugins,
  }
  return newOptions
}
