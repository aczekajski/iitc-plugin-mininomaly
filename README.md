# iitc-mininomaly-plugin

Provides possibility to run local unofficial anomaly-like events for your Ingress community.

Key points:
* runs in your browser (no need for servers of any kind)
* doesn't perform any additional requests besides simply refreshing IITC page to take a measurement
* doesn't use external tools (othan than iitc and bookmarks)
* doesn't store data about players

## Implemented mechanics
**Portal battle:** You can provide a playbox through the bookmarks. From the playbox, given number of portals will be chosen every X minutes. At the same time the faction ownership of previous set of portals will be checked. This way the raw score for measurement will be counted. The number and interval between measurements can be configured. Final score for a faction is this faction best result achieved through all measurements. Factions results can be also separately multiplied if you choose to provide a bonus (in case one faction is significantly outnumbered).

**Teams shards:** You set a number and names of teams, a playzone middle point, a radius of the playzone and a distance from middle point to targets `R_t`. At given point in time, the start and end positions for each team will be chosen randomly. These will be evenly spaced, all of them at approximately the same `R_t` distance from middle point. Start and end positions for given team are on the opposite side of middle point (making them separated by distance of `2 * R_t`). Every team has their own target and will have their own shards. Every X minutes, the following things will happen for each team:
1. If the team has a "live" shard, it will jump using the randomly chosen link attached to its current portal. It will only jump to the portals it has never visited before. If it cannot jump anywhere, it will jump to one of the the nearest not-visited portals.
2. If in effect of a jump, the shard jumps into its target, it will score a point for the team and disappear. At the same moment the start adn end points of that team are swapped.
3. If the team has no "live" shard, new target is being randomly chosen in the vicinity of their end point and a new shard is spawned close to the start point.
The game continues for the given number of jumps. Score of a team is measured as a number of already scored shards plus `1 - (D_target / D_init)` where `D_target` is a distance from shard to target and `D_init` is a distance from shard spawning point to target. This means that even is the last shard is not scored, the closer a team can move its shard to the target, the better. If a team is unlucky, they may even get some negative partial points from this formula. Factions are not checked in this game, so teams can be cross-faction. Shards cannot be stolen, which means that moving shard of team #1 into target of team #2 will have no effect for points at all and the shard will continue to jump as described. Whole difficulty of this game lies in the fact that the teams' shortest paths cross somewhere in the middle of the playzone.

## Usage
### Requirements
Required tampermonkey plugins are IITC and Bookmarks plugin. Having more plugins than necessary is not advised since it may slow down or interfere with the Mininomaly plugin.

Optional: "empty" Telegram bot to send measurements info to given chat. Without bot config, measurements info will be logged to console only and therefore disappear after every iitc refresh.

### Installation
1. Go to the ("Releases")[https://github.com/aczekajski/iitc-plugin-mininomaly/releases] and download the `plugin.user.js` file from the newest release.
2. Install it using your userscripts engine of choice (eg. Tampermonkey) and make sure it runs after the IITC.
3. Make sure you're using a modern browser (newest Chrome/Opera is advised)

### Running Portal Battle
1. Set `localStorage` values:
```js
localStorage['PRIV.initMininomalyAutomatically'] = 'true';
localStorage['PRIV.game'] = 'portalBattle';
// if you're using Telegram bot:
localStorage['PRIV.tgBotToken'] = '123456789:qwertyuiop'; // your private token to tg bot (do not share it with anyone!)
localStorage['PRIV.tgChatId'] = '123456789'; // id of chat where your bot should send the measurement info
```
2. Refresh tab with iitc
3. Configure your mininomaly, eg.
```js
plugin.mininomaly.engine.configureMininomaly(
    0, // currently nothing happens at the game preparation time, so it doesn't matter what time you set here
    +new Date('03.09.2019 18:15'), // time of the first measurement. First measurement preparation will happen one interval earlier
    1000*60*15, // measurements interval
    8 // how many measurements will be taken
);
```
4. Initialize portal battle game specific settings:
```js
plugin.mininomaly.portalBattle.initSettings({
    portalsNumber: 10, // how many portals will be randomly chosen as "ornamented" per measurement
    bookmarksFolders: ['city center east', 'city center west'], // OPTIONAL, defaults to ['*'] - array of bookmarks folders names with playbox portals; special values: 'idOthers' (bookmarked portals that are not in folders), '*' (all bookmarked portals, without exceptions)
    bonuses: { E: 1.4, R: 1 }, // OPTIONAL, defaults to { E: 1, R: 1 } - bonus multiplier for the outnumbered faction. If you set R to 2, points earned by the Resistance will be worth two times as much as points earned by Enlightened
});
```
5. Make sure that whole playbox is visible on the IITC and run:
```js
plugin.mininomaly.engine.runMininomaly();
```
6. From now on, everything will happen automatically ;)

### Running Team Shards
1. Set `localStorage` values:
```js
localStorage['PRIV.initMininomalyAutomatically'] = 'true';
localStorage['PRIV.game'] = 'teamShards';
// if you're using Telegram bot:
localStorage['PRIV.tgBotToken'] = '123456789:qwertyuiop'; // your private token to tg bot (do not share it with anyone!)
localStorage['PRIV.tgChatId'] = '123456789'; // id of chat where your bot should send the measurement info
```
2. Refresh tab with iitc
3. Configure your mininomaly, eg.
```js
plugin.mininomaly.engine.configureMininomaly(
    +new Date('03.09.2019 17:30'), // at this time, teams start and end positions will be decided and announced to players
    +new Date('03.09.2019 18:05'), // time of the first shards jump. First shards are spawned one interval earlier
    1000*60*5, // jumps interval
    24 // how many jumps will happen
);
```
4. Initialize team shards game specific settings:
```js
plugin.mininomaly.teamShards.initSettings = (
    { lat: 12.345678, lng: 23.456789 }, // middle point of play zone
    250, // distance in meters from middle point to start and end points (ie. shards spawn points and targets)
    300, // playzone radius, must be greater than previous parameter (shards will never jump outside this area)
    ['Suicide Squad', 'we will win', 'nameless'], // array of teams names
    1, // OPTIONAL, defaults to 0. How many jumps the shard should wait on the same portal if there are no links leading to a non-visited portal before jumping randomly. 0 means that it will always immediately jump to a random portal if it cannot jump through a link
    ['ac494a4adb174a30b77fd122ad967d8b.16', 'fe89869209c64cb49e99a58acaf7d387.16'] // OPTIONAL, defaults to empty list. This is a list of portal GUIDs that will be excluded from the game, even if they are inside of the playzone - you can exclude inaccessible portals this way. To obtain the portals GUIDs, install "Debug: Raw portal JSON data" plugin (from official IITC site), click on portal and click "Raw Data" under the resonators list
);
```
5. Make sure that whole playbox is visible on the IITC and run:
```js
plugin.mininomaly.engine.runMininomaly();
```
6. From now on, everything will happen automatically ;)

### Stopping during mininomaly
This should be used if you made a mistake. Resuming will not work, prepare new game instead.
```js
plugin.mininomaly.engine.stopMininomaly();
```

### Telegram bots configuration
Currently there is no way of communicating the results, start and end points, shards positions, ornamented portals to players other than by sending it to the TG chat. You can do it manually (it will be logged to browser console) but it demands you to sit by the computer which runs the game and will generate a delay in a game. Given that, the most convenient way is to create a TG bot and let the browser send the results to the chat automatically.

### Making sure it works as you wish
It is strongly recommended to test your event before it happens.

If you're not familiar with the plugin, tinker with it first. Run short events in your browser with few measurements and short intervals and see how it works. Make a chat with just you and the tg bot to see if you can set it properly. In case of teams shards, you can set the `localStorage['DEBUG_visualizeOnDrawTools'] = '1';` to see the game visualisation in the IITC.

Make a similiar configuration to the final one and run it a day or few days before the event day. You can set the telegram bot to send it already to the chat with real players, so they can see what to expect on the game day.

Because of unexpected IITC errors that happen from time to time, it is advised to have the DevTools closed while running an event.

#### How to create a telegram bot:
1. Talk to the `@BotFather` bot on Telegram
2. Follow its instructions on how to create a new bot
3. When you're done, look for the "Use this token to access the HTTP API:" line. Below, there will be a token that you need in `localStorage['PRIV.tgBotToken']`. Remember to not share it with anyone!

#### How to make a bot send messages to the right chat
1. Invite your newly created bot to the chat you want your communication to be sent
2. Send `/start` to the `@getidsbot` bot
3. Forward any message from the chat created in point 1 to the `@getidsbot`
4. The bot will reply with the message details and you will find a chat id in "Origin chat" section. Note: do not miss the `-` at the begging if it is there! You need to set this id in `localStorage['PRIV.tgChatId']`

#### How to show a streets on the images sent by tg bot
Unfortunately, for this moment there is no way to use a real maps (if you're a developer and know how to do it, the help will be appreciated!). If you want your players to see the streets (you do want it! 😅), there is a manual way to do it. Before you configure your mininomaly:
1. Draw the streets of a playbox using IITC drawtools plugin (only polylines, no polygons and no circles)
2. In "DrawTools Opt" choose "Copy Drawn Items" and copy it to clipboard
3. In console, type:
```js
localStorage['PRIV.mapLines'] = `HERE_GOES_THE_CLIPBOARD`;
```
replacing `HERE_GOES_THE_CLIPBOARD` with the previously copied drawn items.

### Questions?
If anything is unclear, do not hesitate to open an issue with question 😉

## Development of plugin
1. Install packages (run `npm i`)
1. Add `dev.tamper.js` as your plugin in Tampermonkey
1. Run `npm run dev` task to start serving your plugin (if it runs on different port than `8080`, you need to modify `dev.tamper.js`)
1. See your plugin working ;)

Sourcemaps are being properly emitted so you can debug script in chrome seeing an original source (see `webpack://` in Sources tab; if you can't see it, refresh page with devtools open).

### Building plugin
Run `npm run build` task, your plugin will be built into `dist` directory.

If you set env variable `NODE_ENV` to `production`, the build will be minified and will not containt source maps.
