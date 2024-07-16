document.addEventListener('DOMContentLoaded', function () {
    // Load data and initialize scenes
    Promise.all([
        d3.json('data/usa_states.geojson'),
        d3.csv('data/Provisional_COVID-19_Deaths_by_Race_and_Hispanic_Origin__and_Age_20240524.csv')
    ]).then(function (data) {
        const [geoData, covidData] = data;

        // Initialize scenes
        initScenes(geoData, covidData);

        // Show the first scene
        showScene(1);
    });
});

function showScene(sceneNumber) {
    // Hide all scenes
    d3.selectAll('.scene').classed('active', false);

    // Show the selected scene
    d3.select(`#scene-${sceneNumber}`).classed('active', true);
}
