module.exports = {
    publicPath: './',
    outputDir: 'dist',
    assetsDir: 'assets',
    devServer: {
      historyApiFallback: true
    },
    configureWebpack: {
      devtool: 'source-map'
    }
  };
  