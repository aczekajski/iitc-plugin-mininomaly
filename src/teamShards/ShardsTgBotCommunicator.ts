import { ShardsBotCommunicator, TeamInfo } from "./TeamShardsGame";
import { MininomalyEventSettings, LatLng } from "../commonInterfaces";
import { getPortalData } from "../iitcHelpers";
import { drawMapGeneric, Color } from "../drawMap";

const portalDataToLatLng = (data: PortalData): LatLng => ({
    lat: data.latE6 / 1e6,
    lng: data.lngE6 / 1e6,
});

export default class ShardsTgBotCommunicator implements ShardsBotCommunicator {
    botToken: string;
    chatId: number;
    messagesPrefix: string;

    constructor(botToken: string, chatId: number, messagesPrefix: string = '', shouldSendOverallResult: boolean = true) {
        this.botToken = botToken;
        this.chatId = chatId;
        this.messagesPrefix = messagesPrefix;
    }

    sendStartEndPoints = async (eventSettings: MininomalyEventSettings, teams: TeamInfo[]) => {
        for (let i = 0; i < teams.length; ++i) {
            const team = teams[i];
            await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
                method: 'POST',
                body: JSON.stringify({
                    chat_id: this.chatId,
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true,
                    text: `${this.messagesPrefix}Start location for *${team.name}*:`,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            await fetch(`https://api.telegram.org/bot${this.botToken}/sendLocation`, {
                method: 'POST',
                body: JSON.stringify({
                    chat_id: this.chatId,
                    latitude: team.from.lat,
                    longitude: team.from.lng,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }
    }

    sendJumpResult(currentMeasurement: number, eventSettings: MininomalyEventSettings, teams: TeamInfo[], currentJumpPoints: number[], currentJumpPartialPoints: number[]): void {

        console.log('sendJumpResult', currentMeasurement, eventSettings, teams, currentJumpPoints, currentJumpPartialPoints);

        const isLastJump = currentMeasurement === eventSettings.numberOfMeasurements - 1;
        const beforeFirstJump = currentMeasurement === -1;

        const teamsInfo = teams.map((team, i) => {
            const targetPortal = getPortalData(team.currentTarget);
            const latlng = `${targetPortal.latE6 / 1e6},${targetPortal.lngE6 / 1e6}`;
            const targetInfo = `Target #${i + 1}: ${targetPortal.title} - [Intel](https://intel.ingress.com/intel?ll=${latlng}&z=17&pll=${latlng}) - [GMaps](https://maps.google.com/maps?ll=${latlng}&q=${latlng}%20%28${escape(targetPortal.title)}%29)`;

            const header = `Team *${team.name}*: ${team.points} pts`;

            const pointsScored = currentJumpPoints[i] >= 1 ? `\n⭐ Scored a point now!` : '';

            const shardsList = team.shards.map((shard) => {
                const p = getPortalData(shard.portal);
                const latlng = `${p.latE6 / 1e6},${p.lngE6 / 1e6}`; // 50.064085,19.934536
                return `Shard #${i + 1}: ${p.title} - [Intel](https://intel.ingress.com/intel?ll=${latlng}&z=17&pll=${latlng}) - [GMaps](https://maps.google.com/maps?ll=${latlng}&q=${latlng}%20%28${escape(p.title)}%29)`;
            }).join('\n');

            return header + pointsScored + '\n' + targetInfo + '\n' + shardsList;
        }).join('\n\n');

        const d = new Date(eventSettings.firstMeasurementTime + (currentMeasurement + (beforeFirstJump ? 1 : 0)) * eventSettings.measurementInterval);
        const timeText = `${d.getHours()}:${(d.getMinutes() < 10 ? '0' : '') + d.getMinutes()}`;

        const teamsTempResults = beforeFirstJump ? '' : teams
            .map((team, i) => ({
                name: team.name,
                i,
                points: team.points + (isLastJump ? 0 : currentJumpPartialPoints[i]),
            }))
            .sort((a, b) => b.points - a.points)
            .map((team, n) => `${n + 1}. ${team.name} (${team.points.toFixed(2)})`)
            .join('\n');

        const header = beforeFirstJump
            ? `*Positions of shards and targets for the first jump (at ${timeText}):*\n\n`
            : `*Results of jump ${currentMeasurement + 1} (at ${timeText}):*\n\n`;

        fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
            method: 'POST',
            body: JSON.stringify({
                chat_id: this.chatId,
                parse_mode: 'Markdown',
                disable_web_page_preview: true,
                text: this.messagesPrefix
                    + header
                    + teamsInfo
                    + (beforeFirstJump ? '' : `\n\n----------Ranking-----------\n`)
                    + teamsTempResults,
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

    private teamsColors: Color[] = ['red', 'green', 'orange', 'blue', 'cyan', 'purple', 'turquoise', 'grey', 'dodgerblue'];
    public sendInfoImage = (currentJump: number, eventSettings: MininomalyEventSettings, portals: LatLng[], teams: TeamInfo[]) => {
        const canvas = drawMapGeneric({
            portals,
            drawPortals: true,
            measurementTime: eventSettings.firstMeasurementTime + currentJump * eventSettings.measurementInterval,
            ornamentedPortals: teams
                .filter((team) => team.shards && team.shards.length)
                .map((team, i) => ({
                    pos: portalDataToLatLng(getPortalData(team.shards[0].portal)),
                    color: this.teamsColors[i]
                })),

            targetPortals: teams
                .filter((team) => team.currentTarget)
                .map((team, i) => ({
                    pos: portalDataToLatLng(getPortalData(team.currentTarget)),
                    color: this.teamsColors[i]
                })),

            lines: teams
                .filter((team) => team.shards && team.shards.length)
                .map((team, i) => ({
                    latLngs: team.shards[0].history.slice().reverse().slice(0, 2).map((portal) => portalDataToLatLng(getPortalData(portal))),
                    color: this.teamsColors[i]
                })),

            legend: teams
                .map((team, i) => ({
                    label: `[#${i + 1}] ${team.name}`,
                    color: this.teamsColors[i]
                })),
        });

        canvas.toBlob((blob) => {
            this.sendImage(blob);
        });
    }

}
