/*
 * This file is part of Webpack.
 *
 * (c) Yrgo, högre yrkesutbildning Göteborg.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const path = require('path');

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackConfig = require('../webpack.config');

module.exports = (app, root) => {
  const compiler = webpack(webpackConfig);

  const devMiddleware = webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
  });

  app.use(devMiddleware);
  app.use(webpackHotMiddleware(compiler));

  app.use((req, res, next) => {
    if (req.method === 'GET' && req.accepts('html')) {
      res.write(
        devMiddleware.fileSystem.readFileSync(path.join(root, 'index.html'))
      );
      res.end();
    } else {
      next();
    }
  });
};
