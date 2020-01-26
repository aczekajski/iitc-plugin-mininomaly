import { MininomalyGame, MininomalyEventSettings, LatLng } from "../commonInterfaces";
import visualizeOnIITC from "./visualizeOnIITC";
import { getPortalLocation } from "../iitcHelpers";

export interface ShardInfo {
    history: string[]; // portals ids list
    portal: string; // portal id
}

export interface TeamInfo {
    name: string;
    from: LatLng;
    to: LatLng;
    currentTarget: string; // portal id
    shards: ShardInfo[]; // portals ids
    points: number;
}

export interface ShardsBotCommunicator {
    sendStartEndPoints(eventSettings: MininomalyEventSettings, teams: TeamInfo[]): void;
    sendJumpResult(currentJump: number, eventSettings: MininomalyEventSettings, teams: TeamInfo[], currentJumpPoints: number[], currentJumpPartialPoints: number[]): void;
    sendInfoImage(currentJump: number, eventSettings: MininomalyEventSettings, portals: LatLng[], teams: TeamInfo[]): void;
}

const degToRad = (deg: number) => deg * Math.PI / 180;
const latLength = 110.57; // in km
const lngLengthAtEquator = 111.32; // in km

const randomIndex = (arrLength: number) => Math.floor(Math.random() * arrLength);

export default class TeamShardsGame implements MininomalyGame {
    botCommunicator: ShardsBotCommunicator;

    // serializable settings
    targetsMiddlePoint: LatLng;
    targetsRadius: number; // in meters
    playzoneRadius: number; // in meters
    teams: TeamInfo[];
    blacklistedPortals: string[];

    // TODO: make configurable in future
    readonly howManyShards: number = 1;

    constructor({ botCommunicator }) {
        this.botCommunicator = botCommunicator;
    }

    public initSettings = (targetsMiddlePoint: LatLng, targetsRadius: number, playzoneRadius: number, teams: string[], blacklistedPortals: string[] = []) => {
        this.targetsMiddlePoint = { ...targetsMiddlePoint };
        this.targetsRadius = targetsRadius;
        this.playzoneRadius = playzoneRadius;
        this.teams = teams.map((teamName) => ({
            name: teamName,
            from: null,
            to: null,
            currentTarget: '',
            shards: [],
            points: 0
        }));
        this.blacklistedPortals = blacklistedPortals;
    }

    public prepareGame = (eventSettings: MininomalyEventSettings) => {
        // randomly draw start points
        const numOfTeams = this.teams.length;
        const degreesStep = 180 / numOfTeams;
        const randomOffset = Math.random() * 360;
        const centerLat = this.targetsMiddlePoint.lat;
        const centerLng = this.targetsMiddlePoint.lng;

        for (let i = 0; i < numOfTeams; ++i) {
            const angle = i * degreesStep + (i % 2) * 180 + randomOffset;
            const r = this.targetsRadius; // in meters

            const spawnLat = centerLat + r * Math.sin(degToRad(angle)) / (latLength * 1000);
            const spawnLngLength = Math.cos(spawnLat * Math.PI / 180) * lngLengthAtEquator; // in km
            const spawnLng = centerLng + r * Math.cos(degToRad(angle)) / (spawnLngLength * 1000);

            const targetLat = centerLat + r * Math.sin(degToRad(angle + 180)) / (latLength * 1000);
            const targetLngLength = Math.cos(targetLat * Math.PI / 180) * lngLengthAtEquator; // in km
            const targetLng = centerLng + r * Math.cos(degToRad(angle + 180)) / (targetLngLength * 1000);

            this.teams[i].from = { lat: spawnLat, lng: spawnLng };
            this.teams[i].to = { lat: targetLat, lng: targetLng };
        }

        this.botCommunicator.sendStartEndPoints(eventSettings, this.teams);

        // visualize on iitc
        const DEBUG_visualizeOnDrawTools = !!+localStorage['DEBUG_visualizeOnDrawTools'];
        if (DEBUG_visualizeOnDrawTools) {
            visualizeOnIITC({
                targetsMiddlePoint: this.targetsMiddlePoint,
                targetsRadius: this.targetsRadius,
                playzoneRadius: this.playzoneRadius,
                teams: this.teams,
                getPortalLocation: this.getPortalLocation,
            });
        }
    };

    public prepareNextMeasurement = (nextMeasurement: number, nextMeasurementTime: number, eventSettings: MininomalyEventSettings) => {
        this.teams.forEach((team) => {
            if (!team.shards.length) { // this will happen only on the preparation of the first measurement
                this.chooseTargetsAndShards(team);
            }
        });

        if (nextMeasurement === 0) {
            this.botCommunicator.sendJumpResult(-1, eventSettings, this.teams, this.teams.map(() => 0), this.teams.map(() => 0));
            this.botCommunicator.sendInfoImage(-1, eventSettings, this.getAllPlayzonePortals().map((portal) => getPortalLocation(portal)), this.teams);
        }

        // visualize on iitc
        const DEBUG_visualizeOnDrawTools = !!+localStorage['DEBUG_visualizeOnDrawTools'];
        if (nextMeasurement === 0 && DEBUG_visualizeOnDrawTools) {
            visualizeOnIITC({
                targetsMiddlePoint: this.targetsMiddlePoint,
                targetsRadius: this.targetsRadius,
                playzoneRadius: this.playzoneRadius,
                teams: this.teams,
                getPortalLocation: this.getPortalLocation,
            });
        }
    };

    public takeMeasurement = (currentMeasurement: number, currentMeasurementTime: number, eventSettings: MininomalyEventSettings) => {
        const currentJumpPoints = [];
        const currentJumpPartialPoints = [];
        this.teams.forEach((team, i) => {
            // perform shards jumps
            team.shards = team.shards.map((shard) => {
                const destinations: string[] = this.getPossibleShardDestinations(shard);

                const destination = destinations[randomIndex(destinations.length)];
                return {
                    history: [...shard.history, destination],
                    portal: destination
                };
            });

            // if shard is in target, delete it and score a point
            let points = team.shards.length;
            team.shards = team.shards.filter((shard) => shard.portal !== team.currentTarget);
            points -= team.shards.length;
            team.points += points;
            currentJumpPoints[i] = points;

            // calculate the partial results
            currentJumpPartialPoints[i] = 0;
            team.shards.forEach((shard) => {
                const pos = this.getPortalLocation(shard.portal);
                const originLocation = this.getPortalLocation(shard.history[0]);
                const targetLocation = this.getPortalLocation(team.currentTarget);
                const shardToTarget = this.dist(pos, targetLocation);
                const originToTarget = this.dist(originLocation, targetLocation);

                const partialPoint = 1 - shardToTarget / originToTarget;
                currentJumpPartialPoints[i] += partialPoint;
            });

            // the last measurement
            if (currentMeasurement === eventSettings.numberOfMeasurements - 1) {
                // add partial points to teams points
                team.points += currentJumpPartialPoints[i];
            }

            // if the team has no shards
            if (!team.shards.length) {
                // swap spawn and target points
                const newTo = team.from;
                team.from = team.to;
                team.to = newTo;

                this.chooseTargetsAndShards(team);
            }
        });

        // bot communication
        this.botCommunicator.sendJumpResult(currentMeasurement, eventSettings, this.teams, currentJumpPoints, currentJumpPartialPoints);
        this.botCommunicator.sendInfoImage(currentMeasurement, eventSettings, this.getAllPlayzonePortals().map((portal) => getPortalLocation(portal)), this.teams);

        // visualize on iitc
        const DEBUG_visualizeOnDrawTools = !!+localStorage['DEBUG_visualizeOnDrawTools'];
        if (DEBUG_visualizeOnDrawTools) {
            visualizeOnIITC({
                targetsMiddlePoint: this.targetsMiddlePoint,
                targetsRadius: this.targetsRadius,
                playzoneRadius: this.playzoneRadius,
                teams: this.teams,
                getPortalLocation: this.getPortalLocation,
            });
        }
    };

    private getAllPlayzonePortals = (): string[] =>
        Object.keys(window.portals).filter((portalId) => {
            const pos = this.getPortalLocation(portalId);
            return this.isInPlayzone(pos);
        });


    private chooseTargetsAndShards = (team: TeamInfo) => {
        // choose new target
        const possibleTargets = this.chooseClosestPortals(team.to, 3);
        team.currentTarget = possibleTargets[randomIndex(possibleTargets.length)];

        // choose new shard
        // TODO: chosing more than one
        const possibleShards = this.chooseClosestPortals(team.from, 3);
        const portal = possibleShards[randomIndex(possibleShards.length)];
        team.shards.push({
            history: [portal],
            portal,
        });
    };

    private getPossibleShardDestinations = (shard: ShardInfo): string[] => {
        let destinations: string[] = [];
        if (window.links) {
            Object.values(window.links).forEach((link) => {
                if (link.options && link.options.data) {
                    let dest: string;
                    let destLatLng: LatLng;

                    // check if any end of link is at given portal
                    if (link.options.data.dGuid === shard.portal) {
                        dest = link.options.data.oGuid;
                        destLatLng = {
                            lat: link.options.data.oLatE6 / 1e6,
                            lng: link.options.data.oLngE6 / 1e6,
                        };
                    } else if (link.options.data.oGuid === shard.portal) {
                        dest = link.options.data.dGuid;
                        destLatLng = {
                            lat: link.options.data.dLatE6 / 1e6,
                            lng: link.options.data.dLngE6 / 1e6,
                        };
                    }

                    // check if found possible destination is not outside configured zone
                    // and if it's not in a shard history
                    // TODO:
                    // TODO: make configurable time of shard backtracking prevention (use only a part of history)
                    if (dest && this.dist(this.targetsMiddlePoint, destLatLng) <= this.playzoneRadius && shard.history.indexOf(dest) === -1) {
                        destinations.push(dest);
                    }
                }
            });
        }

        // check if destinations is not empty
        if (!destinations.length) {
            // if it is, choose some closest portals
            // except from the portals it was previously
            return this.chooseClosestPortals(this.getPortalLocation(shard.portal), 3, shard.history);
        }

        return destinations;
    }

    public end = () => {

    };

    public serialize = () => JSON.stringify({
        targetsMiddlePoint: this.targetsMiddlePoint,
        targetsRadius: this.targetsRadius,
        playzoneRadius: this.playzoneRadius,
        teams: this.teams,
        blacklistedPortals: this.blacklistedPortals
    });

    public deserialize = (serialized: string) => {
        const deserialized = JSON.parse(serialized);

        this.targetsMiddlePoint = deserialized.targetsMiddlePoint;
        this.targetsRadius = deserialized.targetsRadius;
        this.playzoneRadius = deserialized.playzoneRadius;
        this.teams = deserialized.teams;
        this.blacklistedPortals = deserialized.blacklistedPortals;
    };

    private dist = (a: LatLng, b: LatLng) => {
        var p = Math.PI / 180;
        var c = Math.cos;
        var aa = 0.5 - c((b.lat - a.lat) * p) / 2 +
            c(a.lat * p) * c(b.lat * p) *
            (1 - c((b.lng - a.lng) * p)) / 2;

        return 12742000 * Math.asin(Math.sqrt(aa)); // 2 * R; R = 6371 km
    }

    private isInPlayzoneCache = {};
    private isInPlayzone = (pos: LatLng): boolean => {
        const key = pos.lat + ',' + pos.lng;
        const cached = this.isInPlayzoneCache[key];
        if (typeof cached == 'boolean') {
            return cached;
        }
        const dist = this.dist(this.targetsMiddlePoint, pos);
        const isIn = dist <= this.playzoneRadius;
        this.isInPlayzoneCache[key] = isIn;
        return isIn;
    }

    private chooseClosestPortals = (position: LatLng, howMany: number = 1, blacklist: string[] = []): string[] => {
        const distances: Array<{ dist: number; id: string; }> = [];

        Object.keys(window.portals).forEach((portalId) => {
            const pos = this.getPortalLocation(portalId);
            const dist = this.dist(position, pos);
            const isInPlayzone = this.isInPlayzone(pos);
            const isNotBlacklisted = !blacklist.includes(portalId) && !this.blacklistedPortals.includes(portalId);

            if (isInPlayzone && isNotBlacklisted) {
                distances.push({
                    dist,
                    id: portalId,
                });
            }
        });

        return distances
            .sort((a, b) => a.dist - b.dist)
            .slice(0, howMany)
            .map((distInfo) => distInfo.id);
    }

    private getPortalLocation = getPortalLocation;
}
