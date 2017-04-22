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

import App from './components/App/App';

/*
 * This is the production application index file.
 *
 * @author Magnus Bergman <hello@magnus.sexy>
 */

/**
 * Render react.
 */
render(<App />, document.getElementById('root'));
