import TgBotCommunicator from "./TgBotCommunicator";
import MiniNomalyPlugin from "./MininomalyPlugin";
import NoopCommunicator from "./NoopCommunicator";

if (window.localStorage['PRIV.initMininomalyAutomatically'] === 'true') {
    let botCommunicator;
    if (window.localStorage['PRIV.tgBotToken'] && window.localStorage['PRIV.tgChatId']) {
        botCommunicator = new TgBotCommunicator(window.localStorage['PRIV.tgBotToken'], +window.localStorage['PRIV.tgChatId']);
    } else {
        botCommunicator = new NoopCommunicator();
    }
    const miniNomalyPlugin = new MiniNomalyPlugin({ botCommunicator });
    window.plugin.miniNomalyPlugin = miniNomalyPlugin;
}
