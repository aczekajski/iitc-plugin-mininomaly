import TgBotCommunicator from "./portalBattle/TgBotCommunicator";
import NoopCommunicator from "./portalBattle/NoopCommunicator";
import { BotCommunicator } from "./portalBattle/interfaces";
import PortalBattleGame from "./portalBattle/PortalBattleGame";
import Mininomaly from "./Mininomaly";
import TeamShardsGame, { ShardsBotCommunicator } from "./teamShards/TeamShardsGame";
import ShardsNoopCommunicator from "./teamShards/ShardsNoopCommunicator";
import ShardsTgBotCommunicator from "./teamShards/ShardsTgBotCommunicator";

if (window.localStorage['PRIV.initMininomalyAutomatically'] === 'true') {
    if (window.localStorage['PRIV.game'] === 'portalBattle') {
        let botCommunicator: BotCommunicator;

        if (window.localStorage['PRIV.tgBotToken'] && window.localStorage['PRIV.tgChatId']) {
            botCommunicator = new TgBotCommunicator(window.localStorage['PRIV.tgBotToken'], +window.localStorage['PRIV.tgChatId'], /*'🚧 MINI-ANOMALY TEST 🚧\n'*/'', false);
        } else {
            botCommunicator = new NoopCommunicator();
        }

        const portalBattle = new PortalBattleGame({ botCommunicator });
        const engine = new Mininomaly({ game: portalBattle });

        window.plugin.mininomaly = {
            portalBattle,
            engine
        };
    } else if (window.localStorage['PRIV.game'] === 'teamShards') {
        let botCommunicator: ShardsBotCommunicator;

        if (window.localStorage['PRIV.tgBotToken'] && window.localStorage['PRIV.tgChatId']) {
            botCommunicator = new ShardsTgBotCommunicator(window.localStorage['PRIV.tgBotToken'], +window.localStorage['PRIV.tgChatId'], /*'🚧 MINI-ANOMALY TEST 🚧\n'*/'', false);
        } else {
            botCommunicator = new ShardsNoopCommunicator();
        }

        const teamShards = new TeamShardsGame({ botCommunicator });
        const engine = new Mininomaly({ game: teamShards });

        window.plugin.mininomaly = {
            teamShards,
            engine
        };
    } else {
        console.warn('Mininomaly game not chosen!');
    }

}
