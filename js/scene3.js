function loadScene3() {
    console.log('Loading Scene 3');
    const svg = d3.select("#scene")
        .append("svg")
        .attr("width", 800)
        .attr("height", 600);

    // Filter the data for the necessary fields
    const data = window.covidData.map(d => ({
        ageGroup: d["Age group"],
        deaths: +d["COVID-19 Deaths"]
    }));

    console.log('Scene 3 Data:', data);

    const xScale = d3.scaleBand()
        .domain(data.map(d => d.ageGroup))
        .range([0, 800])
        .padding(0.4);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.deaths)])
        .range([600, 0]);

    const line = d3.line()
        .x(d => xScale(d.ageGroup))
        .y(d => yScale(d.deaths));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line)
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .attr("opacity", 1);

    svg.append("g")
        .attr("transform", "translate(0,600)")
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Add annotations
    const annotations = [
        { note: { label: "COVID-19 deaths by age group", title: "Age Group Analysis" }, x: 400, y: 50 }
    ];

    const makeAnnotations = d3.annotation()
        .type(d3.annotationLabel)
        .annotations(annotations)
        .on('subjectover', function (annotation) {
            annotation.type.a.selectAll('g.annotation-connector, g.annotation-note').classed('hidden', false);
        })
        .on('subjectout', function (annotation) {
            annotation.type.a.selectAll('g.annotation-connector, g.annotation-note').classed('hidden', true);
        });

    svg.append("g")
        .call(makeAnnotations);

    svg.selectAll('g.annotation-connector, g.annotation-note').classed('hidden', true);
}
