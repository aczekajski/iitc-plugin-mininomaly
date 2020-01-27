
To see the game in IITC:
1. Make sure you have DrawTools installed.
2. Import the following draw:
```
[{"type":"circle","latLng":{"lat":35.69435392283978,"lng":139.76568460464478},"radius":486.0618444493037,"color":"#a24ac3"}]
```
3. Go to the following portal: https://intel.ingress.com/intel?ll=35.694807,139.765495&z=17&pll=35.694807,139.765495
4. Adjust zoom level to see the whole purple circle (but still have the all portals zoom)
5. Go to https://intel.ingress.com/intel (to remove params from URL)
6. Configure the game according to the main instruction

Configuration (points 3-5 from the main instruction):
```js
localStorage['DEBUG_visualizeOnDrawTools'] = '1';

const start = Math.ceil(+new Date()/60000)*60000;
const inter = 1000*60*1;
const teams = ['one', 'two', 'three', 'four', 'five', 'six'];

plugin.mininomaly.teamShards.initSettings({ lat: 35.69435392283978, lng: 139.76568460464478 }, 420, 486, teams, 1, ['b4015977539449cfbd0cfe59846286e4.16']);
plugin.mininomaly.engine.configureMininomaly(start, start + 2 * inter, inter, 5);

plugin.mininomaly.engine.runMininomaly();
```

This will play a very fast test. It will send the teams start points at the beginning of nearest minute (ie. when seconds on a clock hit 00). One minute later the first shards will spawn. From this moment, every one minute, a jump will occur. 5 jumps will happen.

One portal is excluded because it's across the big street. If shard cannot jump by the link, it will wait for one jump before making a random jump.
