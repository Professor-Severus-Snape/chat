// ---------- конфигурационный файл webpack: ----------
const { merge } = require('webpack-merge'); // извлекаем функцию merge()

const commonConfig = require('./webpack.common.config');
const productionConfig = require('./webpack.production.config');
const developmentConfig = require('./webpack.development.config');

module.exports = (env) => {
  if (env.development) {
    return merge(commonConfig, developmentConfig); // слияние 2ух конфигурационных файлов
  }
  return merge(commonConfig, productionConfig); // слияние 2ух конфигурационных файлов
};
