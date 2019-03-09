import { BookmarksPortalInfo } from "./interfaces";

const getLatLng = (latlng: string) => {
    const split = latlng.split(',');
    return { lat: +split[0], lng: +split[1] };
}

interface LatLng {
    lat: number;
    lng: number;
}

interface Pos {
    x: number;
    y: number;
}

export default (allPortals: BookmarksPortalInfo[], ornamentedPortals: BookmarksPortalInfo[], previousPortals?: BookmarksPortalInfo[]) => {
    const canvas = document.createElement('canvas');

    const posMin: LatLng = { lat: Infinity, lng: Infinity };
    const posMax: LatLng = { lat: -Infinity, lng: -Infinity };

    for (const portal of allPortals) {
        const pos = getLatLng(portal.latlng);
        if (pos.lat < posMin.lat) posMin.lat = pos.lat;
        if (pos.lng < posMin.lng) posMin.lng = pos.lng;
        if (pos.lat > posMax.lat) posMax.lat = pos.lat;
        if (pos.lng > posMax.lng) posMax.lng = pos.lng;
    }

    const multiplier = 100000;

    const margins = 20;

    const canvasWidth = Math.ceil(Math.abs((posMin.lng - posMax.lng) * multiplier)) + 2 * margins;
    const canvasHeight = Math.ceil(Math.abs((posMin.lat - posMax.lat) * multiplier)) + 2 * margins;

    const latLngToXY = (latLng: LatLng): Pos => {
        return {
            x: (latLng.lng - posMin.lng) * multiplier + margins,
            y: canvasHeight - ((latLng.lat - posMin.lat) * multiplier + margins),
        }
    }

    canvas.setAttribute('width', canvasWidth.toString());
    canvas.setAttribute('height', canvasHeight.toString());

    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgb(20, 20, 20)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = 'rgba(0, 255, 236, 0.3)';
    ctx.strokeStyle = 'rgb(0, 255, 236)';
    ctx.lineWidth = 2;
    for (const portal of ornamentedPortals) {
        const pos = latLngToXY(getLatLng(portal.latlng));
        const r = 10;
        ctx.beginPath()
        ctx.moveTo(pos.x + r, pos.y);
        ctx.lineTo(pos.x + r / 2, pos.y + r * Math.sqrt(3) / 2);
        ctx.lineTo(pos.x - r / 2, pos.y + r * Math.sqrt(3) / 2);
        ctx.lineTo(pos.x - r, pos.y);
        ctx.lineTo(pos.x - r / 2, pos.y - r * Math.sqrt(3) / 2);
        ctx.lineTo(pos.x + r / 2, pos.y - r * Math.sqrt(3) / 2);
        ctx.lineTo(pos.x + r, pos.y);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    }

    //PREV

    if (previousPortals) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        for (const portal of previousPortals) {
            const pos = latLngToXY(getLatLng(portal.latlng));
            const r = 5;
            // ctx.fillRect((pos.lng - posMin.lng) * multiplier - 5, canvasHeight - (pos.lat - posMin.lat) * multiplier - 5, 10, 10);
            ctx.beginPath()
            ctx.arc(
                pos.x,
                pos.y,
                r,
                0,
                Math.PI * 2,
            );
            ctx.stroke();
            ctx.closePath();
            // ctx.fillRect(, 10, 10);
        }
    }
    //
    // const imageData = canvas.toDataURL("image/png");

    // const image = document.createElement('img');
    // image.setAttribute('style', 'position:absolute;top:0;left:0;z-index:9999999999999;');
    // image.setAttribute('src', imageData);
    // document.body.appendChild(image);

    // canvas.toBlob((blob) => {
    //     TgBotCommunicator.sendImage(blob);
    // });

    return canvas;
}
