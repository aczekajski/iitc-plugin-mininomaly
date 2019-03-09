# mininomaly-plugin

Provides possibility to run local portal battle event for your community. Runs in your browser, doesn't perform excessive requests, doesn't use external tools, doesn't store data about players.

## Usage
### Requirements
Required tampermonkey plugins are IITC and Bookmarks plugin. Having more plugins than necessary is not advised since it may slow down or interfere with the Mininomaly plugin.

### Configuration
```js
plugin.miniNomalyPlugin.configureMininomaly(
    +new Date('03.09.2019 18:06'), // Timestamp of first measurement. First portals info will be sent an 'measurementInterval' time earlier
    1000*60*15, // measurementInterval - how often will the measurement occur
    4, // how many measurements will be taken
    10, // how many portals will be randomly chosen per measurement
    ['my playbox'], // OPTIONAL, defaults to ['*'] - array of bookmarks folders names with playbox portals; special values: 'idOthers' (bookmarked portals that are not in folders), '*' (all bookmarked portals, without exceptions)
    { E: 1.4, R: 1 }, // OPTIONAL, defaults to { E: 1, R: 1 } - bonus multiplier for the outnumbered faction. If you set R to 2, points earned by the Resistance will be worth two times as much as points earned by Enlightened
);
```

### Running
1. Set localStorage values:
```js
window.localStorage['PRIV.initMininomalyAutomatically'] = 'true';
window.localStorage['PRIV.tgBotToken'] = '123456789:qwertyuiop'; // your private token to tg bot
window.localStorage['PRIV.tgChatId'] = '123456789'; // id of chat where your bot should send the measurement info
```
2. Configure your mininomaly
3. Refresh tab with iitc
4. Run:
```js
plugin.miniNomalyPlugin.runMininomaly();
```

### Stopping during mininomaly
This should be used if you made a mistake. Resuming is not advised.
```js
plugin.miniNomalyPlugin.stopMininomaly();
```

## Development of plugin
1. Install packages (run `npm i`)
1. Add `dev.tamper.js` as your plugin in Tampermonkey
1. Run `npm run dev` task to start serving your plugin (if it runs on different port than `8080`, you need to modify `dev.tamper.js`)
1. See your plugin working ;)

Sourcemaps are being properly emitted so you can debug script in chrome seeing an original source (see `webpack://` in Sources tab; if you can't see it, refresh page with devtools open).

## Building plugin
Run `npm run build` task, your plugin will be built into `dist` directory.

If you set env variable `NODE_ENV` to `production`, the build will be minified and will not containt source maps.
