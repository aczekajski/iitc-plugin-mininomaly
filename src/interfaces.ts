export interface BookmarksPortalInfo {
    label: string;
    latlng: string;
    guid: string;
}

export interface MiniNomalySettings {
    firstMeasurementTime: number;
    measurementInterval: number;
    numberOfMeasurements: number;
    portalsNumber: number;
    bookmarksFolders: string[];
    bonuses: MeasurementPoints;
}

export interface MeasurementPoints {
    R: number;
    E: number;
    N?: number;
}

export interface MeasurementData {
    portals: string[];
    points: MeasurementPoints;
    details: any;
}

export interface BotCommunicator {
    sendNextMeasurementList(measurementNumber: number, time: number, portals: BookmarksPortalInfo[]): void;
    sendNextMeasurementImage(allPortals: BookmarksPortalInfo[], ornamented: BookmarksPortalInfo[], previous?: BookmarksPortalInfo[]): void;
    sendMeasurementResult(measurementNumber: number, points: MeasurementPoints, totalPoints: MeasurementPoints): void;
}
