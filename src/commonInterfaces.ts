export interface BookmarksPortalInfo {
    label: string;
    latlng: string;
    guid: string;
}

export interface LatLng {
    lat: number;
    lng: number;
}

export interface MininomalyEventSettings {
    preparationTime?: number;
    firstMeasurementTime: number;
    measurementInterval: number;
    numberOfMeasurements: number;
}

export interface MeasurementPoints {
    R: number;
    E: number;
    N?: number;
}

export interface MininomalyGame {
    prepareGame: (eventSettings: MininomalyEventSettings) => void;
    prepareNextMeasurement: (nextMeasurement: number, nextMeasurementTime: number, eventSettings: MininomalyEventSettings) => void;
    takeMeasurement: (currentMeasurement: number, currentMeasurementTime: number, eventSettings: MininomalyEventSettings) => void;
    end: () => void;

    serialize: () => string;
    deserialize: (serialized: string) => void;
}
