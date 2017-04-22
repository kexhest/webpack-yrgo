/*
 * This file is part of Webpack.
 *
 * (c) Yrgo, högre yrkesutbildning Göteborg.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import React from 'react';
import { render } from 'react-dom';

import { AppContainer } from 'react-hot-loader';

import App from './components/App/App';

/*
 * This is the dev application index file.
 *
 * @author Magnus Bergman <hello@magnus.sexy>
 */

/**
 * Render react with hot module replacement.
 *
 * @param {Class|function} Component
 *
 * @return {void}
 */
const renderHot = Component => {
  render(
    <AppContainer>
      <Component />
    </AppContainer>,
    document.getElementById('root')
  );
};

renderHot(App);

if (module.hot) {
  module.hot.accept('./components/App/App', () => {
    renderHot(require('./components/App/App').default);
  });
}
