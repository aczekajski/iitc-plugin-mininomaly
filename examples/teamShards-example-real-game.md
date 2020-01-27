
To see the game in IITC:
1. Make sure you have DrawTools installed.
2. Import the following draw:
```
[{"type":"circle","latLng":{"lat":50.0625250172566,"lng":19.93896245956421},"radius":412.5,"color":"#a24ac3"}]
```
3. Go to the following portal: https://intel.ingress.com/intel?ll=50.062276,19.938786&z=17&pll=50.062276,19.938786
4. Adjust zoom level to see the whole purple circle (but still have the all portals zoom)
5. Go to https://intel.ingress.com/intel (to remove params from URL)
6. Configure the game according to the main instruction

Configuration (points 3-5 from the main instruction):
```js
const preparation = +new Date('01.02.2020 12:45');
const start = +new Date('01.02.2020 13:00');
const inter = 1000*60*4;
const teams = ['one',
    'two',
    'three',
    'four',
    'five',
    'six',
].sort(() => Math.random()-0.5);
const middle = { lat: 50.0625250172566, lng: 19.93896245956421 };
const exclude = ['ac494a4adb174a30b77fd122ad967d8b.16', 'fe89869209c64cb49e99a58acaf7d387.16'];

plugin.mininomaly.teamShards.initSettings(middle, 330, 412.5, teams, 1, exclude);
plugin.mininomaly.engine.configureMininomaly(preparation, start + inter, inter, 15);

plugin.mininomaly.engine.runMininomaly();
```

This is a game that will happen on January 1st 2020.

Timeline:
| time  | event                                     |
| ----- | ----------------------------------------- |
| 12:45 | The start positions will be sent to teams |
| 13:00 | The first shards will spawn               |
| 13:04 | jump #1                                   |
| 13:08 | jump #2                                   |
| 13:12 | jump #3                                   |
| 13:16 | jump #4                                   |
| 13:20 | jump #5                                   |
| 13:24 | jump #6                                   |
| 13:28 | jump #7                                   |
| 13:32 | jump #8                                   |
| 13:36 | jump #9                                   |
| 13:40 | jump #10                                  |
| 13:44 | jump #11                                  |
| 13:48 | jump #12                                  |
| 13:52 | jump #13                                  |
| 13:56 | jump #14                                  |
| 14:00 | jump #15 and final score announcement     |

Two portals are excluded because they're hard to access. If shard cannot jump by the link, it will wait for one jump before making a random jump.
