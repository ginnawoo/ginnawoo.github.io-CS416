function loadScene2() {
    console.log('Loading Scene 2');
    const svg = d3.select("#scene")
        .append("svg")
        .attr("width", 800)
        .attr("height", 600);

    // Filter the data for the necessary fields
    const data = window.covidData.map(d => ({
        race: d["Race and Hispanic Origin Group"],
        deaths: +d["COVID-19 Deaths"]
    }));

    console.log('Scene 2 Data:', data);

    const xScale = d3.scaleBand()
        .domain(data.map(d => d.race))
        .range([0, 800])
        .padding(0.4);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.deaths)])
        .range([600, 0]);

    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.race))
        .attr("y", d => yScale(0))
        .attr("width", xScale.bandwidth())
        .attr("height", 0)
        .attr("fill", "steelblue")
        .transition()
        .duration(800)
        .attr("y", d => yScale(d.deaths))
        .attr("height", d => 600 - yScale(d.deaths));

    svg.append("g")
        .attr("transform", "translate(0,600)")
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Add annotations
    const annotations = [
        { note: { label: "COVID-19 deaths by race and ethnicity", title: "Disparities in COVID-19 Deaths" }, x: 400, y: 100 }
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
