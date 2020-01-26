import { BookmarksPortalInfo, MeasurementPoints } from "../commonInterfaces";
import { BotCommunicator } from "./interfaces";
import { drawMapGeneric } from "../drawMap";
import { getLatLngFromBookmark } from "../iitcHelpers";

export default class TgBotCommunicator implements BotCommunicator {
    botToken: string;
    chatId: number;
    messagesPrefix: string;
    shouldSendOverallResult: boolean;

    constructor(botToken: string, chatId: number, messagesPrefix: string = '', shouldSendOverallResult: boolean = true) {
        this.botToken = botToken;
        this.chatId = chatId;
        this.messagesPrefix = messagesPrefix;
        this.shouldSendOverallResult = shouldSendOverallResult;
    }

    sendNextMeasurementList = (measurementNumber: number, time: number, portals: BookmarksPortalInfo[]) => {
        const d = new Date(time);
        const timeText = `${d.getHours()}:${(d.getMinutes() < 10 ? '0' : '') + d.getMinutes()}`;
        fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
            method: 'POST',
            body: JSON.stringify({
                chat_id: this.chatId,
                parse_mode: 'Markdown',
                disable_web_page_preview: true,
                text: `${this.messagesPrefix}**Portals for measurement ${measurementNumber + 1} (at ${timeText}):**\n` +
                    portals
                        .map(
                            (p) => `⭐ ${p.label} - [Intel](https://intel.ingress.com/intel?ll=${p.latlng}&z=17&pll=${p.latlng}) - [GMaps](https://maps.google.com/maps?ll=${p.latlng}&q=${p.latlng}%20%28${escape(p.label)}%29)`
                        )
                        .join('\n'),
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    sendNextMeasurementImage = (allPortals: BookmarksPortalInfo[], ornamented: BookmarksPortalInfo[], previous: BookmarksPortalInfo[], measurementNumber: number, measurementTime: number) => {
        const canvas = drawMapGeneric({
            portals: allPortals.map(getLatLngFromBookmark),
            ornamentedPortals: ornamented.map((portal) => ({ pos: getLatLngFromBookmark(portal) })),
            measurementNumber,
            measurementTime,
        });

        canvas.toBlob((blob) => {
            this.sendImage(blob);
        });
    }

    sendMeasurementResult = (measurementNumber: number, numberOfMeasurements: number, points: MeasurementPoints, totalPoints: MeasurementPoints) => {
        const enlTotal = `ENL: ${totalPoints.E.toFixed(2)} ${new Array(Math.round(totalPoints.E + 1)).join('💚')}`;
        const resTotal = `RES: ${totalPoints.R.toFixed(2)} ${new Array(Math.round(totalPoints.R + 1)).join('💙')}`;
        const current = `${new Array(Math.round(points.E + 1)).join('💚')}\n${new Array(Math.round(points.R + 1)).join('💙')}\nENL ${points.E}:${points.R} RES`;

        const resultText = `${this.messagesPrefix}Measurement ${measurementNumber + 1}/${numberOfMeasurements} raw result:\n${current}`;
        const overallResultText = this.shouldSendOverallResult ? `\n\n**OVERALL:**\n${totalPoints.E >= totalPoints.R ? enlTotal + '\n' + resTotal : resTotal + '\n' + enlTotal}` : '';

        fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
            method: 'POST',
            body: JSON.stringify({
                chat_id: this.chatId,
                parse_mode: 'Markdown',
                disable_web_page_preview: true,
                text: resultText + overallResultText,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    private sendImage = (imageBlob) => {
        const formData = new FormData();

        formData.append('photo', imageBlob);

        fetch(`https://api.telegram.org/bot${this.botToken}/sendPhoto?chat_id=${this.chatId}`, {
            method: 'POST',
            body: formData
        });
    }
}
