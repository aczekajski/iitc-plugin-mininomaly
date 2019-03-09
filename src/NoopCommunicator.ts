import { BookmarksPortalInfo, MeasurementPoints, BotCommunicator } from "./interfaces";

export default class NoopCommunicator implements BotCommunicator {

    sendNextMeasurementList = (measurementNumber: number, time: number, portals: BookmarksPortalInfo[]) => {
        console.log('sendNextMeasurementList', measurementNumber, time, portals);
    }

    sendNextMeasurementImage = (allPortals: BookmarksPortalInfo[], ornamented: BookmarksPortalInfo[], previous: BookmarksPortalInfo[]) => {
        console.log('sendNextMeasurementImage', allPortals, ornamented, previous);
    }

    sendMeasurementResult = (measurementNumber: number, points: MeasurementPoints, totalPoints: MeasurementPoints) => {
        console.log('sendMeasurementResult', measurementNumber, points, totalPoints);
    }
}
