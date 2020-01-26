// custom types providing info about whatever your plugin expect to be in the global scope

declare function $(selector: any): any;

declare var GM_info: any;

declare function dialog(config: {}): void;

declare var L: any;

interface PortalData {
    health: number;
    image: string;
    level: number;
    latE6: number;
    lngE6: number;
    resCount: number;
    team: 'R' | 'E' | 'N';
    title: string;
}

interface Window {
    plugin: any;
    addHook: (hook: string, callback: () => void) => void;
    removeHook: (hook: string, callback: () => void) => void;
    addLayerGroup: (...args) => any;
    bootPlugins: Array<any>;
    iitcLoaded: boolean;
    map: any; // TODO: prepare better interface
    portals: {
        [key: string]: {
            _latlng?: { lat: number; lng: number; };
            options?: { data?: PortalData; guid: string; };
        }
    }; // TODO: prepare better interface
    links: { [key: string]: any }; // TODO: prepare better interface
    selectedPortal: any; // TODO: prepare better interface
    ornaments: any; // TODO: prepare better interface
    artifact: any; // TODO: prepare better interface
}
