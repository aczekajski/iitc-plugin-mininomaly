import { BookmarksPortalInfo } from "./interfaces";

const mapLines = window.localStorage['PRIV.mapLines'] || [];

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

export default (allPortals: BookmarksPortalInfo[], ornamentedPortals: BookmarksPortalInfo[], previousPortals: BookmarksPortalInfo[], measurementNumber: number, measurementTime: number) => {
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

    const multiplier = 1000;
    const latLength = 110.57;
    const lngLengthAtEquator = 111.32;
    // 1 degree of Longitude = cosine (latitude in decimal degrees) * length of degree (miles) at equator.
    const latMean = (posMin.lat + posMax.lat) / 2;
    const lngLength = Math.cos(latMean * Math.PI / 180) * lngLengthAtEquator;

    const margins = 20;

    const canvasWidth = Math.ceil(Math.abs((posMin.lng - posMax.lng) * multiplier * lngLength)) + 2 * margins;
    const canvasHeight = Math.ceil(Math.abs((posMin.lat - posMax.lat) * multiplier * latLength)) + 2 * margins;

    const latLngToXY = (latLng: LatLng): Pos => {
        return {
            x: (latLng.lng - posMin.lng) * multiplier * lngLength + margins,
            y: canvasHeight - ((latLng.lat - posMin.lat) * multiplier * latLength + margins),
        }
    }

    canvas.setAttribute('width', canvasWidth.toString());
    canvas.setAttribute('height', canvasHeight.toString());

    const ctx = canvas.getContext('2d');

    // draw bg
    ctx.fillStyle = 'rgb(20, 20, 20)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // draw streets
    ctx.strokeStyle = 'rgb(50, 50, 50)';
    ctx.lineWidth = 3;
    for (const path of mapLines) {
        const points = path.latLngs;
        const first = points.shift();
        ctx.beginPath();
        const pos = latLngToXY(first);
        ctx.moveTo(pos.x, pos.y);
        for (const point of points) {
            const pos = latLngToXY(point);
            ctx.lineTo(pos.x, pos.y);
        }
        ctx.stroke();
    }

    // draw ornaments
    ctx.fillStyle = 'rgba(0, 255, 236, 0.3)';
    ctx.strokeStyle = 'rgb(0, 255, 236)';
    ctx.lineWidth = 2;
    for (const portal of ornamentedPortals) {
        const pos = latLngToXY(getLatLng(portal.latlng));
        const r = 10;
        ctx.beginPath();
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

    const measurementDate = new Date(measurementTime);
    const timeText = `${measurementDate.getHours()}:${(measurementDate.getMinutes() < 10 ? '0' : '') + measurementDate.getMinutes()}`;
    ctx.fillStyle = 'rgb(0, 255, 236)';
    ctx.font = '14px Coda';
    ctx.textAlign = 'right';
    ctx.fillText(`measurement at ${timeText}`, canvasWidth - 5, canvasHeight - 5);
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
