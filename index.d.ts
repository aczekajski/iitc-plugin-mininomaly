// custom types providing info about whatever your plugin expect to be in the global scope

declare function $(selector: any): any;

declare var GM_info: any;

declare function dialog(config: {}): void;

declare var L: any;

interface Window {
    plugin: any;
    addHook: (hook: string, callback: () => void) => void;
    removeHook: (hook: string, callback: () => void) => void;
    addLayerGroup: (...args) => any;
    bootPlugins: Array<any>;
    iitcLoaded: boolean;
    map: any; // TODO: prepare better interface
    portals: { [key: string]: any }; // TODO: prepare better interface
    selectedPortal: any; // TODO: prepare better interface
    ornaments: any; // TODO: prepare better interface
    artifact: any; // TODO: prepare better interface
}
