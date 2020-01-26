import { BookmarksPortalInfo, MeasurementPoints } from "../commonInterfaces";

export interface BotCommunicator {
    sendNextMeasurementList(measurementNumber: number, time: number, portals: BookmarksPortalInfo[]): void;
    sendNextMeasurementImage(allPortals: BookmarksPortalInfo[], ornamented: BookmarksPortalInfo[], previous: BookmarksPortalInfo[], measurementNumber: number, measurementTime: number): void;
    sendMeasurementResult(measurementNumber: number, numberOfMeasurements: number, points: MeasurementPoints, totalPoints: MeasurementPoints): void;
}
