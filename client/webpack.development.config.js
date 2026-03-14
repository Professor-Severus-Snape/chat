// ---------- настройки для webpack в режиме 'development': ----------
module.exports = {
  mode: 'development', // режим сборки
  devtool: 'inline-source-map', // контроль генерации source maps

  devServer: {
    historyApiFallback: true,
    open: true,
    compress: true,
    port: 8080,
  },
};
