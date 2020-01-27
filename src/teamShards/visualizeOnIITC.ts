export default (data) => {
    const colors = ['red', 'green', 'orange', 'blue', 'cyan', 'purple', 'turquoise', 'grey', 'dodgerblue'];
    const dt = window.plugin.drawTools;

    try {
        // clean dt
        delete localStorage['plugin-draw-tools-layer'];
        dt.drawnItems.clearLayers();
        dt.load();

        // import new dt
        dt.import([
            {
                type: 'circle',
                latLng: data.targetsMiddlePoint,
                radius: data.playzoneRadius,
                color: '#bbb'
            },
            {
                type: 'circle',
                latLng: data.targetsMiddlePoint,
                radius: data.targetsRadius,
                color: '#888'
            },
            ...data.teams.map((team, i) => ({
                type: "circle",
                latLng: team.from,
                radius: 50,
                color: colors[i]
            })),
            ...data.teams.map((team, i) => ({
                type: "circle",
                latLng: team.to,
                radius: 80,
                color: colors[i]
            })),
            ...data.teams.filter((team) => team.shards.length > 0).map((team, i) => ({
                type: 'marker',
                latLng: data.getPortalLocation(team.shards[0].portal),
                color: colors[i]
            })),
            ...data.teams.filter((team) => team.shards.length > 0 && team.shards[0].history.length > 1).map((team, i) => ({
                type: 'polyline',
                latLngs: team.shards[0].history.map((portal) => data.getPortalLocation(portal)),
                color: colors[i]
            })),
            ...data.teams.filter((team) => !!team.currentTarget).map((team, i) => ({
                type: "circle",
                latLng: data.getPortalLocation(team.currentTarget),
                radius: 20,
                color: colors[i]
            })),
        ]);

        dt.save();
    } catch(e) {
        console.log('Error when visualizing on iitc', e);
    }
}
