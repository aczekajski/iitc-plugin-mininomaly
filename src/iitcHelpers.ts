import { LatLng, BookmarksPortalInfo } from "./commonInterfaces";

export const getPortalLocation = (portalId: string): LatLng => {
    const portal = window.portals[portalId];
    return portal && portal._latlng;
}

export const getPortalData = (portalId: string) => {
    const portal = window.portals[portalId];
    return portal && portal.options && portal.options.data;
}

export const getLatLngFromE6String = (latlng: string): LatLng => {
    const split = latlng.split(',');
    return { lat: +split[0], lng: +split[1] };
}

export const getLatLngFromBookmark = (portal: BookmarksPortalInfo) => getLatLngFromE6String(portal.latlng);
