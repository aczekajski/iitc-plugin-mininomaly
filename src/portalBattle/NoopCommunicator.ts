import { BookmarksPortalInfo, MeasurementPoints } from "../commonInterfaces";
import { BotCommunicator } from "./interfaces";

export default class NoopCommunicator implements BotCommunicator {

    sendNextMeasurementList = (measurementNumber: number, time: number, portals: BookmarksPortalInfo[]) => {
        console.log('sendNextMeasurementList', measurementNumber, time, portals);
    }

    sendNextMeasurementImage = (allPortals: BookmarksPortalInfo[], ornamented: BookmarksPortalInfo[], previous: BookmarksPortalInfo[], measurementNumber: number, measurementTime: number) => {
        console.log('sendNextMeasurementImage', allPortals, ornamented, previous, measurementNumber, measurementTime);
    }

    sendMeasurementResult = (measurementNumber: number, numberOfMeasurements: number, points: MeasurementPoints, totalPoints: MeasurementPoints) => {
        console.log('sendMeasurementResult', measurementNumber, numberOfMeasurements, points, totalPoints);
    }
}
