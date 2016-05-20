var path = require('path');
var webpack = require('webpack');

var loaders = [
  {
    "test": /\.js?$/,
    "exclude": /node_modules/,
    "loader": "babel",
    "query": {
      "presets": [
        "es2015",
        "stage-0"
      ],
      "plugins": []
    }
  }
];

module.exports = {
  entry: path.resolve('lib', 'index.js'),
  output: {
    path: path.resolve('dist'),
    filename: 'index.js',
    library: 'RxjsApp',
    libraryTarget: 'umd'
  },
  externals: {
    'rxjs': 'rxjs'
  },
  module: {
    loaders: loaders
  }
};
