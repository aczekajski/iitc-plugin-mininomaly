import { MininomalyGame, MininomalyEventSettings, BookmarksPortalInfo, MeasurementPoints } from "../commonInterfaces";
import { BotCommunicator } from "./interfaces";

interface PortalBattleSettings {
    portalsNumber: number;
    bookmarksFolders?: string[];
    bonuses?: MeasurementPoints;
}

interface PortalBattleMeasurementData {
    portals: string[];
    points: MeasurementPoints;
    details: any;
}

export default class PortalBattleGame implements MininomalyGame {
    measurements: PortalBattleMeasurementData[] = [];
    settings: PortalBattleSettings;
    botCommunicator: BotCommunicator;

    constructor({ botCommunicator }: { botCommunicator: BotCommunicator; }) {
        this.botCommunicator = botCommunicator;
    }

    public initSettings = (settings: PortalBattleSettings) => {
        this.settings = {
            portalsNumber: settings.portalsNumber,
            bookmarksFolders: settings.bookmarksFolders ? [...settings.bookmarksFolders] : ['*'],
            bonuses: settings.bonuses ? { ...settings.bonuses } : { E: 1, R: 1 },
        };
    }

    public prepareGame = (eventSettings: MininomalyEventSettings) => {
        // nothing to prepare
    };

    public prepareNextMeasurement = (nextMeasurement: number, nextMeasurementTime: number, eventSettings: MininomalyEventSettings) => {
        const nextMeasurementPortals = this.chooseRandomPortals(this.settings.portalsNumber);
        this.measurements.push({
            portals: nextMeasurementPortals.map((p) => p.guid),
            points: null,
            details: null,
        });

        // bot communication about next measurement
        this.botCommunicator.sendNextMeasurementList(
            nextMeasurement,
            nextMeasurementTime,
            nextMeasurementPortals
        );
        this.botCommunicator.sendNextMeasurementImage(
            this.getAllPlayboxPortals(),
            nextMeasurementPortals,
            this.getAllPlayboxPortals(),
            nextMeasurement,
            nextMeasurementTime,
        );
    };

    public takeMeasurement = (currentMeasurement: number, currentMeasurementTime: number, eventSettings: MininomalyEventSettings) => {
        const measurementResult = this.getRawScore(this.measurements[currentMeasurement].portals);
        console.log(measurementResult);
        this.measurements[currentMeasurement].points = measurementResult.points;
        this.measurements[currentMeasurement].details = measurementResult.details;

        // bot communication about current measurement results
        const total = this.calculateTotalResult();
        this.botCommunicator.sendMeasurementResult(currentMeasurement, eventSettings.numberOfMeasurements, measurementResult.points, total);
    };

    public end = () => {
        console.log('the end');
    };

    public serialize = () => JSON.stringify({
        measurements: this.measurements,
        settings: this.settings,
    });

    public deserialize = (serialized: string) => {
        const deserialized = JSON.parse(serialized);
        this.measurements = deserialized.measurements as PortalBattleMeasurementData[];
        this.settings = deserialized.settings as PortalBattleSettings;
    };

    private chooseRandomPortals = (howMany: number): BookmarksPortalInfo[] => {
        const all = this.getAllPlayboxPortals();

        const chosen = [];
        for (let i = 0; i < howMany; ++i) {
            let index = Math.floor(Math.random() * all.length);
            if (index === all.length) {
                index = all.length - 1;
            }

            chosen.push(all.splice(index, 1)[0]);
        }

        return chosen;
    }

    private getAllPlayboxPortals = () => {
        const bkm = window.plugin && window.plugin.bookmarks && window.plugin.bookmarks.bkmrksObj && window.plugin.bookmarks.bkmrksObj.portals;

        if (!bkm) return;

        const all = [];
        for (const folderId in bkm) {
            const folder = bkm[folderId];
            const folderName = folder.label;
            if (this.settings.bookmarksFolders.indexOf(folderName) >= 0 || this.settings.bookmarksFolders.indexOf(folderId) >= 0 || this.settings.bookmarksFolders.indexOf('*') >= 0) {
                for (const portalId in folder.bkmrk) {
                    const portal = folder.bkmrk[portalId];

                    all.push(portal);
                }
            }
        }

        return all;
    }

    private getRawScore = (portalIds: string[]) => {
        const points = {
            R: 0,
            E: 0,
        }
        const details = {};
        for (const portalId of portalIds) {
            const portal = window.portals[portalId];
            if (portal && portal.options && portal.options.data) {
                const owner = portal.options.data.team;
                points[owner]++;
                details[portal.options.guid] = {
                    ...portal.options.data,
                    guid: portal.options.guid,
                }
            }
        }
        return { points, details };
    }

    private calculateTotalResult = () => {
        const total = { E: 0, R: 0 };
        for (const m of this.measurements) {
            if (m.points) {
                if (m.points.E * this.settings.bonuses.E > total.E) {
                    total.E = m.points.E * this.settings.bonuses.E;
                }
                if (m.points.R * this.settings.bonuses.R > total.R) {
                    total.R = m.points.R * this.settings.bonuses.R;
                }
            }
        }
        return total;
    }
}
