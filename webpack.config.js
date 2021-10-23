/* eslint-disable */
const path = require('path')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: {
    background: './src/background/index.ts',
    options: './src/options/index.tsx',
  },
  devtool: 'source-map',
  mode: 'development',
  performance: {
    hints: false,
  },
  node: false,
  optimization: {
    minimize: false,
    moduleIds: 'named',
    chunkIds: 'named',
    concatenateModules: false,
    // splitChunks: {
    //   chunks: (chunk) => {
    //     return ['options', 'background'].includes(chunk.name)
    //   },
    // },
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.module.scss'],
    plugins: [new TsconfigPathsPlugin()],
  },
  output: {
    filename: '[name]/index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.tsx$/,
        use: {
          loader: 'babel-loader'
        },
        exclude: /node_modules/,
      },
      {
        test: /\.module\.scss$/i,
        use: ["style-loader","css-modules-typescript-loader","css-loader","postcss-loader", "sass-loader"],
      },
    ]
  },
  plugins: [
    // new HtmlWebpackPlugin({
    //   template: 'src/options/options.html',
    //   filename: 'options.html',
    //   chunks: ['options'],
    // }),
    new CopyPlugin({
      patterns: [
        'README.md',
        'LICENSE',
        'src/manifest.json',
        { from: '**/*.html', context: 'src' },
        { from: '**/*.css', context: 'src',  },
        { from: '**/*.svg', context: 'src' },
        { from: 'src/_locales', to: '_locales' },
        // { from: 'src/ui/vendor', to: 'vendor' },
      ],
    }),
  ],
  devServer: {
    hot: false,
    inline: false,
    writeToDisk: true,
  },
}
