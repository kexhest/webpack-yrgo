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
const http = require('http');
const express = require('express');

const root = path.join(__dirname, '../build');
const production = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 3000;

const app = express();

if (production) {
  require('./server.prod')(app, root);
} else {
  require('./server.dev')(app, root);
}

const server = http.createServer(app);

server.listen(port, err => {
  if (err) console.log(err);

  console.log('Server running on port %s', port);
});
