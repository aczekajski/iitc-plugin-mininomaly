import { LatLng } from "./commonInterfaces";
import colors from "./colors";

const mapLines = JSON.parse(window.localStorage['PRIV.mapLines'] || '[]');

const getLatLngFromE6 = (latlng: string): LatLng => {
    const split = latlng.split(',');
    return { lat: +split[0], lng: +split[1] };
}

const degToRad = (deg: number) => deg * Math.PI / 180;

interface Pos {
    x: number;
    y: number;
}

export type Color = [number, number, number] | string;

interface GenericMapSettings {
    portals: LatLng[];
    drawPortals?: boolean;
    measurementNumber?: number;
    measurementTime?: number;

    ornamentedPortals?: Array<{ pos: LatLng; color?: Color; }>;
    targetPortals?: Array<{ pos: LatLng; color?: Color; }>;

    lines?: Array<{ latLngs: LatLng[], color?: Color }>;

    legend?: Array<{ label: string; color: Color; }>;
}

const DEFAULT_ORNAMENT_COLOR: Color = [0, 255, 236];

const getColor = (color: Color, alpha: number = 0) => {
    let colorArray = color;
    if (typeof color === 'string') {
        colorArray = colors[color] || DEFAULT_ORNAMENT_COLOR;
    }
    const [r, g, b] = colorArray as [number, number, number];

    return alpha > 0 ? `rgba(${r}, ${g}, ${b}, ${alpha})` : `rgb(${r}, ${g}, ${b})`;
}

const drawNGon = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, r: number, n: number) => {
    for (let i = 0; i <= n; ++i) {
        const angle = degToRad(i * 360 / n);
        const x = centerX + r * Math.sin(angle);
        const y = centerY + r * Math.cos(angle);
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
}

export const drawMapGeneric = ({
    portals,
    drawPortals,
    measurementNumber,
    measurementTime,
    ornamentedPortals,
    targetPortals,
    lines,
    legend,
}: GenericMapSettings) => {
    const canvas = document.createElement('canvas');

    const posMin: LatLng = { lat: Infinity, lng: Infinity };
    const posMax: LatLng = { lat: -Infinity, lng: -Infinity };

    for (const portal of portals) {
        const pos = portal;
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
    const legendEntrySpace = 30;
    const legendMargin = ((legend && legend.length || 0) + 1) * legendEntrySpace;

    const canvasWidth = Math.ceil(Math.abs((posMin.lng - posMax.lng) * multiplier * lngLength)) + 2 * margins;
    const canvasHeight = Math.ceil(Math.abs((posMin.lat - posMax.lat) * multiplier * latLength)) + 2 * margins + legendMargin;

    const latLngToXY = (latLng: LatLng): Pos => {
        return {
            x: (latLng.lng - posMin.lng) * multiplier * lngLength + margins,
            y: canvasHeight - ((latLng.lat - posMin.lat) * multiplier * latLength + margins) - legendMargin,
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
        ctx.closePath();
    }

    // draw lines
    if (lines) {
        for (const line of lines) {
            const points = line.latLngs;
            const first = points.shift();

            ctx.strokeStyle = getColor(line.color || DEFAULT_ORNAMENT_COLOR);
            ctx.lineWidth = 2;
            ctx.beginPath();
            const pos = latLngToXY(first);
            ctx.moveTo(pos.x, pos.y);
            for (const point of points) {
                const pos = latLngToXY(point);
                ctx.lineTo(pos.x, pos.y);
            }
            ctx.stroke();
            ctx.closePath();
        }
    }

    // draw ornaments (hexagonal)
    ctx.lineWidth = 2;
    if (ornamentedPortals) {
        for (const portal of ornamentedPortals) {
            ctx.fillStyle = getColor(portal.color || DEFAULT_ORNAMENT_COLOR, 0.3);
            ctx.strokeStyle = getColor(portal.color || DEFAULT_ORNAMENT_COLOR);

            const pos = latLngToXY(portal.pos);
            const r = 10;
            ctx.beginPath();
            drawNGon(ctx, pos.x, pos.y, r, 6);
            ctx.stroke();
            ctx.fill();
            ctx.closePath();
        }
    }

    // draw targets (triangles)
    ctx.lineWidth = 2;
    if (targetPortals) {
        for (const portal of targetPortals) {
            ctx.fillStyle = getColor(portal.color || DEFAULT_ORNAMENT_COLOR, 0.3);
            ctx.strokeStyle = getColor(portal.color || DEFAULT_ORNAMENT_COLOR);

            const pos = latLngToXY(portal.pos);
            const r = 18;
            ctx.beginPath();
            drawNGon(ctx, pos.x, pos.y, r, 3);
            ctx.stroke();
            ctx.fill();
            ctx.closePath();
        }
    }

    //PREV

    if (drawPortals) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        if (portals) {
            for (const portal of portals) {
                const pos = latLngToXY(portal);
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
    }

    // draw bg
    ctx.fillStyle = 'rgb(20, 20, 20)';
    ctx.fillRect(0, canvasHeight - legendMargin, canvasWidth, canvasHeight);

    // draw legend
    const measurementDate = new Date(measurementTime);
    const timeText = `${measurementDate.getHours()}:${(measurementDate.getMinutes() < 10 ? '0' : '') + measurementDate.getMinutes()}`;
    ctx.fillStyle = 'rgb(0, 255, 236)';
    ctx.font = '14px Coda, Roboto, Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`measurement at ${timeText}`, canvasWidth - 5, canvasHeight - 5);

    if (legend) {
        legend.forEach((entry, i) => {
            ctx.fillStyle = 'rgb(180, 180, 180)';
            ctx.textAlign = 'left';
            ctx.fillText(entry.label, 40, canvasHeight - legendMargin + i * legendEntrySpace + 1.5 * legendEntrySpace - 10);

            ctx.fillStyle = getColor(entry.color || DEFAULT_ORNAMENT_COLOR, 0.3);
            ctx.strokeStyle = getColor(entry.color || DEFAULT_ORNAMENT_COLOR);

            const pos = {
                x: 20,
                y: canvasHeight - legendMargin + i * legendEntrySpace + legendEntrySpace
            };
            const r = 10;
            ctx.beginPath();
            drawNGon(ctx, pos.x, pos.y, r, 6);
            ctx.stroke();
            ctx.fill();
            ctx.closePath();
        });
    }

    return canvas;
}
