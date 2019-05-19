import TgBotCommunicator from "./TgBotCommunicator";
import MiniNomalyPlugin from "./MininomalyPlugin";
import NoopCommunicator from "./NoopCommunicator";
import { BotCommunicator } from "./interfaces";

if (window.localStorage['PRIV.initMininomalyAutomatically'] === 'true') {
    let botCommunicator: BotCommunicator;
    if (window.localStorage['PRIV.tgBotToken'] && window.localStorage['PRIV.tgChatId']) {
        botCommunicator = new TgBotCommunicator(window.localStorage['PRIV.tgBotToken'], +window.localStorage['PRIV.tgChatId'], /*'🚧 MINI-ANOMALY TEST 🚧\n'*/'', false);
    } else {
        botCommunicator = new NoopCommunicator();
    }
    const miniNomalyPlugin = new MiniNomalyPlugin({ botCommunicator });
    window.plugin.miniNomalyPlugin = miniNomalyPlugin;
}
