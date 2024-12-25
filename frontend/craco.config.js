const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          crypto: require.resolve('crypto-browserify'),
          stream: require.resolve('stream-browserify'),
          buffer: require.resolve('buffer/'),
          vm: require.resolve('vm-browserify'),
          http: require.resolve('stream-http'),
          https: require.resolve('https-browserify'),
          process: false
        }
      }
    },
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer']
      }),
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(process.env)
      })
    ]
  }
};
