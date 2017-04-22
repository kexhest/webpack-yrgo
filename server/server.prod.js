/*
 * This file is part of Webpack.
 *
 * (c) Yrgo, högre yrkesutbildning Göteborg.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const express = require('express');
const compression = require('compression');

module.exports = (app, root) => {
  app.use(compression());

  app.use(express.static(root, { maxage: 31557600 }));

  app.use((req, res, next) => {
    if (req.method === 'GET' && req.accepts('html')) {
      res.header('Cache-Control', 'max-age=60, must-revalidate, private');

      res.sendFile('index.html', { root });
    } else {
      next();
    }
  });
};
