/*
 * This file is part of Webpack.
 *
 * (c) Yrgo, högre yrkesutbildning Göteborg.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import React, { Component } from 'react';

import './app.scss';

/*
 * This is the app component.
 *
 * @author Magnus Bergman <hello@magnus.sexy>
 */
export default class App extends Component {
  /**
   * Render app.
   *
   * @returns {Object}
   */
  render() {
    return <p className="app">Hello World</p>;
  }
}
