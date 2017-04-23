# 20 - Webpack

[<img src="https://media.giphy.com/media/3orieLRhPWEKoTheus/giphy.gif" alt="webpack" width="100%">](https://github.com/magnus-bergman/webpack)

### Introduction
Webpack är en av de mest populära module bundlers som används idag. Det finns en hel uppsjö av olika bundlers och task managers och det kommer nya hela tiden. Men en webpack är väldigt kraftfull och har mognat väldigt mycket i det senaste. En stor svaghet till webpack har varit dokumentation, men detta är något som de jobbat väldigt hårt för att förbättra i version 2.

Webpack utgår från en eller flera ingångs punkter, och skapar ett slags träd (dependency graph) över allt som ingångspunkten är beroende av. Allt i webpack hanteras som moduler och webpack kan ta emot vilka filtyper som helst. Så en bild kan vara en modul t.ex. Man måste bara berätta för webpack hur de olika filtyperna ska hanteras. Detta görs via loaders när en modul importeras, det finns även ett par punkter i själva bundlings fasen som man kan lyssna på vilket gör det möjligt att skriva plugins för olika ändamål.

t.ex. kan man välja att dela upp sin kod för att göra det möjligt att bara ladda in de delar man behöver vid specifika delar av applikationen, extrahera css, generera service workers osv.

Allt detta definieras i ett konfigurations objekt.

Vi ska gå igenom hur man sätter upp webpack för smidig utveckling i react, med hot reloading av komponenter och hur man bygger ut react i produktionsmiljö.

Vi kommer att bygga på vår webpack konfiguration allt eftersom vi jobbar vidare med vårt react projekt.

---
### Installation and Configuration

`yarn init`

`yarn add webpack`

`touch entry.js`

`touch webpack.config.js`

webpack.config.js
```javascript
const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, 'entry.js'),
  output: {
    filename: 'bundle.js',
  },
};
```

package.json (för att slippa ha webpack installerat globalt)
```json
"scripts": {
  "build": "webpack"
},
```

Detta är allt som behövs för att köra webpack.

#### Loaders
En loader är en funktion som anropas varje gång en fil matchar en regel definierad i konfigurationen. Den tar innehållet i filen som argument och returnerar en modifierad version av innehållet.

En av de enklaste loadersarna är [raw-loader](https://github.com/webpack-contrib/raw-loader/blob/master/index.js), det den gör är egentligen bara att läsa allt innehåll i en fil och returnera det som en sträng.
```javascript
/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function(content) {
  this.cacheable && this.cacheable();
  this.value = content;
  return "module.exports = " + JSON.stringify(content);
}
```

Vi ska bygga react och använda es6, eftersom alla browsers inte stödjer es6 än så måste vi transpilera koden vår kod till es5. Det finns många olika transpilatorer också, men den största är babel och det är den vi ska använda.

Förutom själva [babel-loader](https://github.com/babel/babel-loader) så behöver vi installera babel-core och ett par presets.

`yarn add babel-loader babel-core babel-preset-env babel-preset-react babel-plugin-transform-class-properties babel-plugin-transform-object-rest-spread`

`touch .babelrc`

.babelrc
```json
{
  "presets": [
    ["env", {
      "targets": {
        "ie": 9,
        "uglify": true,
      },
      "modules": false,
      "loose": true
    }],
    "react"
  ],
  "plugins": [
    "transform-class-properties",
    "transform-object-rest-spread"
  ]
}
```

För att berätta för webpack att den ska transpilera all vår javascript med babel så måste vi sätta upp regler för att matcha på javascript filer.

webpack.config.js
```javascript
const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, 'entry.js'),
  output: {
    filename: 'bundle.js',
  },
  module: {
    // Array of instructions that tell webpack
    // how it should handle different types of modules.
    rules: [
      {
        // Mathches all files that ends with .js
        test: /\.js$/,
        use: {
          // Transpile matching files with babel
          loader: 'babel-loader',
        },
        // Ignore files from node_modules to avoid
        // transpiling packages that (probably)
        // already are transpiled.
        exclude: /(node_modules)/,
      },
    ],
  },
};
```

---
### Development
En av anledningarna till att webpack först blev populärt var Hot Module Replacement (HMR) i React. Detta gör det möjligt att injecta uppdateringar av komponenter utan att behöva ladda om sidan, vilket är väldigt smidigt när man utvecklar.

I de första versionerna av HMR så användes webpacks inbyggda dev server. Men vi ska konfigurera sin egen server i node med express och använda middlewares.

`yarn add express react-hot-loader@next webpack-dev-middleware webpack-hot-middleware`

.babelrc
```json
{
  "presets": [
    ["env", {
      "targets": {
        "ie": 9,
        "uglify": true,
      },
      "modules": false,
      "loose": true
    }],
    "react"
  ],
  "plugins": [
    "transform-class-properties",
    "transform-object-rest-spread",
    "react-hot-loader/babel"
  ]
}
```

server.js
```javascript
const path = require('path');
const express = require('express');

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const webpackConfig = require('./webpack.config');

const root = path.join(__dirname, 'build');
const port = 3000;

const compiler = webpack(webpackConfig);

const devMiddleware = webpackDevMiddleware(compiler, {
  publicPath: webpackConfig.output.publicPath,
});

const app = express();

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

app.listen(port, err => {
  if (err) console.log(err);

  console.log('Server running on port %s', port);
});
```

webpack.config.js
```javascript
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const src = path.resolve(__dirname, 'src');
const dest = path.resolve(__dirname, 'build');

module.exports = {
  entry: [
    'react-hot-loader/patch',
    'webpack-hot-middleware/client',
    path.join(src, 'entry.js'),
  ],
  output: {
    path: dest,
    publicPath: '/',
    filename: 'bundle.js',
  },
  module: {
    // Array of instructions that tell webpack
    // how it should handle different types of modules.
    rules: [
      {
        // Mathches all files that ends with .js, or .jsx
        test: /\.jsx?$/,
        use: [
          {
            // Transpile matching files with babel
            loader: 'babel-loader',
          },
        ],
        // Ignore files from node_modules to avoid
        // transpiling packages that (probably)
        // already are transpiled.
        exclude: /(node_modules)/,
      },
      {
        // Mathches all files that ends with .scss
        test: /\.scss$/,
        use: [
          {
            // creates style nodes
            loader: 'style-loader',
          },
          {
            // translates CSS into CommonJS
            loader: 'css-loader',
          },
          {
            // compiles Sass to CSS
            loader: 'sass-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(src, 'templates', 'index.html'),
    }),
  ],
};
```

package.json
```json
"scripts": {
  "start": "node server",
  "build": "webpack"
},
```

För att testa att HMR fungerar med react och allt är uppe och rullar behöver vi installera react och react-dom.

`yarn add react react-dom`

och för att få lite bättre struktur på applikationen kan ändra lite i filstrukturen så vi har något som liknar följande:

```
└─┬ src
  ├── entry.js
  └─┬ scripts
    ├── index.js
    └─┬ components
      └─┬ App
        ├── App.js
        └── app.scss
└─┬ templates
  └── index.html
├── .babelrc
├── package.json
├── server.js
├── webpack.config.js
└── yarn.lock
```

src/entry.js
```javascript
import './scripts';
```

src/scripts/index.js
```javascript
import React from 'react';
import { render } from 'react-dom';

import { AppContainer } from 'react-hot-loader';

import App from './components/App/App';

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
```

src/scripts/components/App/App.js
```javascript
import React, { Component } from 'react';

import './app.scss';

export default class App extends Component {
  render() {
    return <p className="app">Hello World</p>;
  }
}
```

src/scripts/components/App/app.scss
```css
.app {
  color: red;
}
```

src/templates/index.html
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <title>YRGO</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

---
### Production
För att bygga ut vår nuvarande applikation i produktion så måste vi begränsa en del av de tillägg vi gjort. Vi måste även säga till react att vi vill bygga ut en produktions versjon av react. Detta gör att varningar och felhantering som react lägger till för att hjälpa oss strippas ut.

Vi börjar med att definiera en del environment variabler och lägger till ett script för att tömma vår build mapp. Detta gör vi för att vi ska hasha våra filnamn för att undvika cachning när vi gör uppdateringar och om vi inte clearar vår output mapp när vi bygger så kommer den fyllas upp med filer som vi inte längre använder.

`yarn add rimraf`

package.json
```json
"scripts": {
  "start": "NODE_ENV=development node server",
  "clean": "rimraf build",
  "prebuild": "npm run clean",
  "build": "NODE_ENV=production webpack -p"
},
```

Vi säger till babel att bara använda HRM i development.

.babelrc
```json
{
  "presets": [
    ["env", {
      "targets": {
        "ie": 9,
        "uglify": true,
      },
      "modules": false,
      "loose": true
    }],
    "react"
  ],
  "plugins": [
    "transform-class-properties",
    "transform-object-rest-spread"
  ],
  "env": {
    "development": {
      "plugins": ["react-hot-loader/babel"]
    }
  }
}
```

Sen uppdaterar vi vår webpack config för att inte inkludera hot reloading i produktion. Vi extraherar all css till en egen fil samt lägger till hashning på både javascript och css. Kanske den viktigaste delen i den nya konfigurationen är webpack.DefinePlugin, denna skickar vidare vår env variabel in till våra script, detta gör att react byggs för produktion och ger oss en env variabel att förhålla oss till i vår egen kod.

webpack.config.js
```javascript
const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const production = process.env.NODE_ENV === 'production';

const src = path.resolve(__dirname, 'src');
const dest = path.resolve(__dirname, 'build');

module.exports = {
  entry: []
    .concat(
      production
        ? []
        : ['react-hot-loader/patch', 'webpack-hot-middleware/client']
    )
    .concat([path.join(src, 'entry.js')]),
  output: {
    path: dest,
    publicPath: '/',
    filename: production ? '[hash:8].js' : 'bundle.js',
  },
  module: {
    // Loaders are triggered when an imported file matches a pattern
    // and then process that file according to the loader specified.
    rules: [
      {
        // Mathches all files that ends with .js
        test: /\.jsx?$/,
        use: [
          {
            // Transpile matching files with babel.
            loader: 'babel-loader',
          },
        ],
        // Ignore files from node_modules to avoid
        // transpiling packages that (probably)
        // already are transpiled.
        exclude: /(node_modules)/,
      },
      {
        test: /\.scss$/,
        use: production
          ? ExtractTextPlugin.extract({
              fallback: 'style-loader',
              use: ['css-loader', 'sass-loader'],
            })
          : ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(production ? 'production' : 'development'),
      },
    }),
    new HtmlWebpackPlugin({
      template: path.join(src, 'templates', 'index.html'),
    }),
  ].concat(production
    ? [new ExtractTextPlugin('[contenthash:8].css')]
    : [new webpack.HotModuleReplacementPlugin()]),
};
```

Eftersom vår index.js just nu inkluderar en del hotreloading kod så måste vi även uppdatera denna. Vi börjar med att klona index.js och döper de två kopierna till index.dev.js och index.prod.js.

Sen uppdaterar vi entry.js till att inkludera riktig index fil beroende på env variabeln som vi definierade i webpack.DefinePlugin.

entry.js
```javascript
if (process.env.NODE_ENV === 'development') {
  require('./scripts/index.dev');
} else {
  require('./scripts/index.prod');
}
```

index.dev.js (kopia av index.js från dev setupen)

index.prod.js
```javascript
import React from 'react';
import { render } from 'react-dom';

import App from './components/App/App';

render(<App />, document.getElementById('root'));
```

För att göra det ännu tydligare att vi är i produktion kan vi uppdatera vår express server för produktion också. Detta är ingenting vi behöver tänka på så länge vi bygger en statisk html sida, men om vi skulle vilja lägga ut vår lösning på t.ex. heroku med vår server setup är det fint om den startas utan massa dev middlewares.

Skapa en mapp som heter server och flytta in server.js i denna. Döp om server.js till index.js.

Vi lägger till compression som är ett express paket för att gzippa assets.

`yarn add compression`

Sen skapar vi en server.prod.js och en server.dev.js och ändrar dem till följande:

index.js
```javascript
const path = require('path');
const http = require('http');
const express = require('express');

const root = path.join(__dirname, '../build');
const production = process.env.NODE_ENV === 'production';
const port = process.env.NODE_PORT || 3000;

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
```

server.dev.js
```javascript
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
```

server.prod.js
```javascript
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
```

Till slut uppdaterar vi vår package.json med ett script för att starta servern i produktion.

package.json
```json
"scripts": {
  "start": "NODE_ENV=production node server",
  "dev": "NODE_ENV=development node server",
  "clean": "rimraf build",
  "prebuild": "npm run clean",
  "build": "NODE_ENV=production webpack -p"
},
```

Nu kan vi köra `yarn dev` för att starta server i dev mode med HMR,
`yarn build` för att bygga vår applikation för produktion och `yarn start` för att starta servern i produktion och se applikationen i produktion med gzippade assets.

---
### Beyond
Det finns mängder av ytterligare funktionalitet man kan lägga till, men det vi har satt upp nu är en väldigt bra grund för att bygga vidare på.

Se gärna över listan på [awesome-webpack](https://github.com/webpack-contrib/awesome-webpack) och [webpack dokumentationen](https://webpack.js.org) för 2.0.

#### Publishing to Heroku
Från det vi har satt upp nu är det t.ex. väldigt enkelt att lägga ut en applikation på heroku, det ända som krävs är att man installerar heroku tool belt genom homebrew och skapar ett konto på heroku och sen kör `heroku create [APP NAME] --region eu`. Då skapas en app i ditt konto på heroku.

Sen lägger man till ett postinstall script i package.json och en Procfile på roten.

package.json
```json
"scripts": {
  "postinstall": "npm run build",
  "start": "NODE_ENV=production node server",
  "dev": "NODE_ENV=development node server",
  "clean": "rimraf build",
  "prebuild": "npm run clean",
  "build": "NODE_ENV=production webpack -p"
},
```

Procfile
```
web: npm start
```

Sen ser man till att skapa ett git repository för sin app om man inte redan gjort det. Efter det kör man `heroku git:remote --app [APP NAME]`. Sen är det bara att köra `git push heroku master`. Efter det är appen publicerad online.

Det finns även andra publicerings verktyg som t.ex. [now](https://zeit.co/now).
