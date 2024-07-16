function initScenes(geoData, covidData) {
    createScene1(geoData, covidData);
    createScene2(covidData);
    createScene3(covidData);
}

function createScene1(geoData, covidData) {
    const scene = d3.select('#visualization').append('div').attr('id', 'scene-1').attr('class', 'scene active');

    scene.append('h2').text('COVID-19 Cases Overview');

    const width = 960, height = 600;

    const svg = scene.append('svg')
        .attr('width', width)
        .attr('height', height);

    const projection = d3.geoAlbersUsa().scale(1000).translate([width / 2, height / 2]);
    const path = d3.geoPath().projection(projection);

    svg.selectAll('path')
        .data(geoData.features)
        .enter().append('path')
        .attr('d', path)
        .attr('fill', '#ccc')
        .attr('stroke', '#333');

    // Process covidData and bind to map (example visualization)
    const stateData = d3.nest()
        .key(d => d.State)
        .rollup(v => d3.sum(v, d => d['COVID-19 Deaths']))
        .entries(covidData);

    const color = d3.scaleQuantize([0, d3.max(stateData, d => d.value)], d3.schemeReds[9]);

    svg.selectAll('path')
        .data(geoData.features)
        .attr('fill', d => {
            const state = stateData.find(s => s.key === d.properties.name);
            return state ? color(state.value) : '#ccc';
        });

    scene.append('p').text('This map shows the distribution of COVID-19 deaths across different states.');
}

function createScene2(covidData) {
    const scene = d3.select('#visualization').append('div').attr('id', 'scene-2').attr('class', 'scene');

    scene.append('h2').text('Health Impact by Race and Ethnicity');

    const width = 960, height = 600;

    const svg = scene.append('svg')
        .attr('width', width)
        .attr('height', height);

    const raceData = d3.nest()
        .key(d => d.Race_and_Hispanic_Origin)
        .rollup(v => d3.sum(v, d => d['COVID-19 Deaths']))
        .entries(covidData);

    const x = d3.scaleBand().domain(raceData.map(d => d.key)).range([0, width]).padding(0.1);
    const y = d3.scaleLinear().domain([0, d3.max(raceData, d => d.value)]).nice().range([height, 0]);

    svg.append('g').selectAll('rect')
        .data(raceData)
        .enter().append('rect')
        .attr('x', d => x(d.key))
        .attr('y', d => y(d.value))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.value))
        .attr('fill', 'steelblue');

    svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x));
    svg.append('g').call(d3.axisLeft(y));

    scene.append('p').text('This bar chart shows the number of COVID-19 deaths by race and ethnicity.');
}

function createScene3(covidData) {
    const scene = d3.select('#visualization').append('div').attr('id', 'scene-3').attr('class', 'scene');

    scene.append('h2').text('State-wise Comparison');

    const width = 960, height = 600;

    const svg = scene.append('svg')
        .attr('width', width)
        .attr('height', height);

    const stateData = d3.nest()
        .key(d => d.State)
        .key(d => d.Race_and_Hispanic_Origin)
        .rollup(v => d3.sum(v, d => d['COVID-19 Deaths']))
        .entries(covidData);

    const races = d3.map(stateData[0].values, d => d.key).keys();
    const x0 = d3.scaleBand().domain(stateData.map(d => d.key)).range([0, width]).padding(0.1);
    const x1 = d3.scaleBand().domain(races).range([0, x0.bandwidth()]);
    const y = d3.scaleLinear().domain([0, d3.max(stateData, d => d3.max(d.values, v => v.value))]).nice().range([height, 0]);

    svg.append('g').selectAll('g')
        .data(stateData)
        .enter().append('g')
        .attr('transform', d => `translate(${x0(d.key)},0)`)
        .selectAll('rect')
        .data(d => d.values)
        .enter().append('rect')
        .attr('x', d => x1(d.key))
        .attr('y', d => y(d.value))
        .attr('width', x1.bandwidth())
        .attr('height', d => height - y(d.value))
        .attr('fill', 'steelblue');

    svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x0));
    svg.append('g').call(d3.axisLeft(y));

    scene.append('p').text('This grouped bar chart shows COVID-19 deaths by race and ethnicity for each state.');
}
