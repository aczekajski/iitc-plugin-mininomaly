import { BookmarksPortalInfo, MeasurementPoints, BotCommunicator } from "./interfaces";
import drawMap from "./drawMap";

export default class TgBotCommunicator implements BotCommunicator {
    botToken: string;
    chatId: number;

    constructor(botToken: string, chatId: number) {
        this.botToken = botToken;
        this.chatId = chatId;
    }

    sendNextMeasurementList = (measurementNumber: number, time: number, portals: BookmarksPortalInfo[]) => {
        const d = new Date(time);
        const timeText = `${d.getHours()}:${d.getMinutes() < 10 ? '0' : '' + d.getMinutes()}`;
        fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
            method: 'POST',
            body: JSON.stringify({
                chat_id: this.chatId,
                parse_mode: 'Markdown',
                disable_web_page_preview: true,
                text: `**Portals for measurement ${measurementNumber + 1} (at ${timeText}):**\n` +
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

    sendNextMeasurementImage = (allPortals: BookmarksPortalInfo[], ornamented: BookmarksPortalInfo[], previous: BookmarksPortalInfo[]) => {
        const canvas = drawMap(allPortals, ornamented, previous);

        canvas.toBlob((blob) => {
            this.sendImage(blob);
        });
    }

    sendMeasurementResult = (measurementNumber: number, points: MeasurementPoints, totalPoints: MeasurementPoints) => {
        const enlTotal = `ENL: ${totalPoints.E.toFixed(2)} ${new Array(Math.round(totalPoints.E + 1)).join('💚')}`;
        const resTotal = `RES: ${totalPoints.R.toFixed(2)} ${new Array(Math.round(totalPoints.R + 1)).join('💙')}`;
        const current = `${new Array(Math.round(points.E + 1)).join('💚')}${new Array(Math.round(points.R + 1)).join('💙')}\nENL ${points.E}:${points.R} RES`;
        fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
            method: 'POST',
            body: JSON.stringify({
                chat_id: this.chatId,
                parse_mode: 'Markdown',
                disable_web_page_preview: true,
                text: `Measurement ${measurementNumber + 1} raw result:\n${current}\n\n**OVERALL:**\n${totalPoints.E >= totalPoints.R ? enlTotal + '\n' + resTotal : resTotal + '\n' + enlTotal}`,
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
