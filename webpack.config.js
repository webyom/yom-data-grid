var path = require('path');

module.exports = {
  entry: './src/yom-data-grid.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'yom-data-grid.js',
    library: 'YomDataGrid',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.(tpl\.html|less)$/,
        use: ['mt2amd-loader']
      }
    ]
  },
  externals: {
    jquery: {
      commonjs2: 'jquery',
      commonjs: 'jquery',
      amd: 'jquery',
      root: '$'
    }
  }
};