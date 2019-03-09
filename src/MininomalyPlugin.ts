import { MiniNomalySettings, MeasurementData, BookmarksPortalInfo, BotCommunicator, MeasurementPoints } from "./interfaces";

export default class MiniNomalyPlugin {
    botCommunicator: BotCommunicator;

    constructor({ botCommunicator }: { botCommunicator: BotCommunicator }) {
        this.botCommunicator = botCommunicator;

        if (+localStorage['mininomaly.running']) {
            console.log('mininomaly: WAITING FOR BOOKMARKS');
            // window.addHook('iitcLoaded', this.runMininomalyTimer);
            const waitTimer = setInterval(() => {
                const portals = this.getAllPlayboxPortals();
                if (portals && portals.length > 0) {
                    clearInterval(waitTimer);
                    this.runMininomalyTimer();
                }
            }, 500);
        }
    }

    configureMininomaly = (
        firstMeasurementTime: number,
        measurementInterval: number,
        numberOfMeasurements: number,
        portalsNumber: number,
        bookmarksFolders: string[] = ['*'],
        bonuses: MeasurementPoints = { E: 1, R: 1 }
    ) => {
        localStorage['mininomaly.settings'] = JSON.stringify({
            firstMeasurementTime,
            measurementInterval,
            numberOfMeasurements,
            portalsNumber,
            bookmarksFolders,
            bonuses
        } as MiniNomalySettings);
    }

    runMininomaly = () => {
        const settings: MiniNomalySettings = this.getOptions();
        if (settings && settings.firstMeasurementTime > +new Date()) {
            localStorage['mininomaly.running'] = '1';
            localStorage['mininomaly.measurements'] = JSON.stringify([]);
            localStorage['mininomaly.nextMeasurement'] = '-1';
            localStorage['mininomaly.phase'] = 'waiting';
            this.runMininomalyTimer();
        } else {
            console.warn('No mininomaly settings found or mininomaly expired');
        }
    }

    private mininomalyTimer: NodeJS.Timer;
    private runMininomalyTimer = () => {
        this.mininomalyTimer = setInterval(this.executeMininomalyPhase, 1000);
        this.executeMininomalyPhase();
    };

    private executeMininomalyPhase = () => {
        const currentMeasurement = +localStorage['mininomaly.nextMeasurement'];
        const options: MiniNomalySettings = this.getOptions();
        console.log('mininomaly phase:', localStorage['mininomaly.phase']);
        switch (localStorage['mininomaly.phase']) {
            case 'waiting':
                const measurementTime = options.firstMeasurementTime + currentMeasurement * options.measurementInterval;
                if (+new Date() >= measurementTime) {
                    if (currentMeasurement >= 0) {
                        clearInterval(this.mininomalyTimer);
                        localStorage['mininomaly.phase'] = 'takeMeasurement';
                        window.location.reload();
                    } else {
                        // choose portals for first measurement
                        this.prepareNextMeasurement(-1, options, []);
                    }
                }
                break;
            case 'takeMeasurement':
                clearInterval(this.mininomalyTimer);
                const measurements: MeasurementData[] = JSON.parse(localStorage['mininomaly.measurements']);
                const mapLoadedCallback = () => {
                    window.removeHook('mapDataRefreshEnd', mapLoadedCallback);

                    const measurementResult = this.takeMeasurement(measurements[currentMeasurement].portals);
                    console.log(measurementResult);
                    measurements[currentMeasurement].points = measurementResult.points;
                    measurements[currentMeasurement].details = measurementResult.details;

                    // save to LS
                    localStorage['mininomaly.measurements'] = JSON.stringify(measurements);

                    // bot communication about current measurement results
                    const total = { E: 0, R: 0 };
                    for (const m of measurements) {
                        if (m.points) {
                            if (m.points.E > total.E) {
                                total.E = m.points.E * options.bonuses.E;
                            }
                            if (m.points.R > total.R) {
                                total.R = m.points.R * options.bonuses.R;
                            }
                        }
                    }
                    this.botCommunicator.sendMeasurementResult(currentMeasurement, measurementResult.points, total);
                }
                console.log('mininomaly: WAITING FOR MAP LOAD');
                window.addHook('mapDataRefreshEnd', mapLoadedCallback);

                this.prepareNextMeasurement(currentMeasurement, options, measurements);

                this.runMininomalyTimer();
                break;
            case 'end':
                this.stopMininomaly();
                // summarize or STH
                break;
        }
    }

    private prepareNextMeasurement = (currentMeasurement: number, options: MiniNomalySettings, measurements: MeasurementData[]) => {
        if (currentMeasurement + 1 < options.numberOfMeasurements) {
            const nextMeasurement = this.chooseRandomPortals(options.portalsNumber);
            measurements.push({
                portals: nextMeasurement.map((p) => p.guid),
                points: null,
                details: null,
            });
            localStorage['mininomaly.nextMeasurement'] = (currentMeasurement + 1).toString();
            localStorage['mininomaly.measurements'] = JSON.stringify(measurements);
            localStorage['mininomaly.phase'] = 'waiting';

            // bot communication about next measurement
            this.botCommunicator.sendNextMeasurementList(
                currentMeasurement + 1,
                options.firstMeasurementTime + (currentMeasurement + 1) * options.measurementInterval,
                nextMeasurement
            );
            this.botCommunicator.sendNextMeasurementImage(
                this.getAllPlayboxPortals(),
                nextMeasurement,
                this.getAllPlayboxPortals(),
            );
        } else {
            localStorage['mininomaly.phase'] = 'end';
        }
    }

    stopMininomaly = () => {
        clearInterval(this.mininomalyTimer);
        localStorage['mininomaly.running'] = '0';
    }

    getOptions = (): MiniNomalySettings => JSON.parse(localStorage['mininomaly.settings']);

    getAllPlayboxPortals = () => {
        const bkm = window.plugin && window.plugin.bookmarks && window.plugin.bookmarks.bkmrksObj && window.plugin.bookmarks.bkmrksObj.portals;

        if (!bkm) return;

        const options = this.getOptions();

        const all = [];
        for (const folderId in bkm) {
            const folder = bkm[folderId];
            const folderName = folder.label;
            if (options.bookmarksFolders.indexOf(folderName) >= 0 || options.bookmarksFolders.indexOf(folderId) >= 0 || options.bookmarksFolders.indexOf('*') >= 0) {
                for (const portalId in folder.bkmrk) {
                    const portal = folder.bkmrk[portalId];

                    all.push(portal);
                }
            }
        }

        return all;
    }

    chooseRandomPortals = (howMany: number): BookmarksPortalInfo[] => {
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

    takeMeasurement = (portalIds: string[]) => {
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

}
