/*
 * This file is part of Webpack.
 *
 * (c) Yrgo, högre yrkesutbildning Göteborg.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

if (process.env.NODE_ENV === 'development') {
  require('./scripts/index.dev');
} else {
  require('./scripts/index.prod');
}
