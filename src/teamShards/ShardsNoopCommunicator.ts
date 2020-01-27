import { ShardsBotCommunicator, TeamInfo } from "./TeamShardsGame";
import { MininomalyEventSettings, LatLng } from "../commonInterfaces";

export default class ShardsNoopCommunicator implements ShardsBotCommunicator {
    sendInfoImage(currentJump: number, eventSettings: MininomalyEventSettings, portals: LatLng[], teams: TeamInfo[]): void {
        console.log('sendStartEndPoints', currentJump, eventSettings, portals, teams);
    }

    sendStartEndPoints(eventSettings: MininomalyEventSettings, teams: TeamInfo[]): void {
        console.log('sendStartEndPoints', eventSettings, teams);
    }

    sendJumpResult(currentMeasurement: number, eventSettings: MininomalyEventSettings, teams: TeamInfo[], currentJumpPoints: number[], currentJumpPartialPoints: number[]): void {
        console.log('sendJumpResult', currentMeasurement, eventSettings, teams, currentJumpPoints, currentJumpPartialPoints);
    }

}
