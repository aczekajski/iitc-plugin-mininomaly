import { MininomalyGame, MininomalyEventSettings } from "./commonInterfaces";

interface MininomalySettings {
    game: MininomalyGame;
}

export default class Mininomaly {
    game: MininomalyGame;

    constructor({ game }: MininomalySettings) {
        this.game = game;

        if (+localStorage['mininomaly.running']) {
            console.log('mininomaly: WAITING FOR BOOKMARKS');
            const waitTimer = setInterval(() => {
                // wait for bookmarks and then launch a timer
                // maybe there's no reason for waiting, since they should just exist in local storage
                const bkm = window.plugin && window.plugin.bookmarks && window.plugin.bookmarks.bkmrksObj && window.plugin.bookmarks.bkmrksObj.portals;
                if (bkm) {
                    clearInterval(waitTimer);

                    if(localStorage['mininomaly.serializedGame']) {
                        this.game.deserialize(localStorage['mininomaly.serializedGame']);
                    }

                    this.runMininomalyTimer();
                }
            }, 500);
        }
    }

    configureMininomaly = (
        preparationTime: number,
        firstMeasurementTime: number,
        measurementInterval: number,
        numberOfMeasurements: number,
    ) => {
        if (preparationTime && preparationTime >= (firstMeasurementTime - measurementInterval)) {
            console.error('Not configured. Preparation time cannot be after first measurement minus measurement interval');
        }
        localStorage['mininomaly.settings'] = JSON.stringify({
            preparationTime,
            firstMeasurementTime,
            measurementInterval,
            numberOfMeasurements,
        } as MininomalyEventSettings);
    }

    runMininomaly = () => {
        const settings: MininomalyEventSettings = this.getOptions();
        if (settings
            && settings.firstMeasurementTime
            && (
                (settings.preparationTime && settings.preparationTime > +new Date())
                || settings.firstMeasurementTime > +new Date()
            )
        ) {
            localStorage['mininomaly.running'] = '1';
            localStorage['mininomaly.nextMeasurement'] = '-1';
            localStorage['mininomaly.phase'] = 'waiting';
            localStorage['mininomaly.serializedGame'] = '';
            localStorage['mininomaly.prepared'] = settings.preparationTime ? '0' : '1';
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
        const eventSettings: MininomalyEventSettings = this.getOptions();
        const currentMeasurement = +localStorage['mininomaly.nextMeasurement'];
        const currentMeasurementTime = eventSettings.firstMeasurementTime + currentMeasurement * eventSettings.measurementInterval;
        const isPrepared = !!+localStorage['mininomaly.prepared'];

        console.log('mininomaly phase:', localStorage['mininomaly.phase']);

        switch (localStorage['mininomaly.phase']) {
            case 'waiting':
                if (isPrepared) {
                    if (+new Date() >= currentMeasurementTime) {
                        if (currentMeasurement >= 0) {
                            clearInterval(this.mininomalyTimer);
                            localStorage['mininomaly.phase'] = 'takeMeasurement';
                            localStorage['mininomaly.serializedGame'] = this.game.serialize();
                            window.location.reload();
                        } else {
                            this.prepareNextMeasurement(-1, currentMeasurementTime + eventSettings.measurementInterval, eventSettings);
                        }
                    }
                } else {
                    const preparationTime = eventSettings.preparationTime;
                    if (+new Date() >= preparationTime) {
                        clearInterval(this.mininomalyTimer);
                        localStorage['mininomaly.phase'] = 'prepare';
                        localStorage['mininomaly.serializedGame'] = this.game.serialize();
                        window.location.reload();
                    }
                }
                break;
            case 'takeMeasurement':
                clearInterval(this.mininomalyTimer);

                const mapLoadedCallback = () => {
                    window.removeHook('mapDataRefreshEnd', mapLoadedCallback);
                    this.game.takeMeasurement(currentMeasurement, currentMeasurementTime, eventSettings);
                }

                console.log('mininomaly: WAITING FOR MAP LOAD');
                window.addHook('mapDataRefreshEnd', mapLoadedCallback);

                this.prepareNextMeasurement(currentMeasurement, currentMeasurementTime + eventSettings.measurementInterval, eventSettings);

                this.runMininomalyTimer();
                break;
            case 'prepare':
                localStorage['mininomaly.prepared'] = '1';
                localStorage['mininomaly.phase'] = 'waiting';

                this.game.prepareGame(eventSettings);
                break;
            case 'end':
                this.stopMininomaly();
                break;
        }
    }

    private prepareNextMeasurement = (currentMeasurement: number, currentMeasurementTime: number, eventSettings: MininomalyEventSettings) => {
        if (currentMeasurement + 1 < eventSettings.numberOfMeasurements) {
            localStorage['mininomaly.nextMeasurement'] = (currentMeasurement + 1).toString();
            localStorage['mininomaly.phase'] = 'waiting';

            this.game.prepareNextMeasurement(currentMeasurement + 1, currentMeasurementTime, eventSettings);
        } else {
            localStorage['mininomaly.phase'] = 'end';
        }
    }

    stopMininomaly = () => {
        clearInterval(this.mininomalyTimer);
        localStorage['mininomaly.running'] = '0';

        this.game.end();
    }

    getOptions = (): MininomalyEventSettings => JSON.parse(localStorage['mininomaly.settings']);

}
