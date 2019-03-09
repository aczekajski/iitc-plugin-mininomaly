import TgBotCommunicator from "./TgBotCommunicator";
import MiniNomalyPlugin from "./MininomalyPlugin";

if (window.localStorage['PRIV.initMininomalyAutomatically'] === 'true') {
    const tgBotCommunicator = new TgBotCommunicator(window.localStorage['PRIV.tgBotToken'], +window.localStorage['PRIV.tgChatId']);
    const miniNomalyPlugin = new MiniNomalyPlugin({ botCommunicator: tgBotCommunicator });
    window.plugin.miniNomalyPlugin = miniNomalyPlugin;
}
