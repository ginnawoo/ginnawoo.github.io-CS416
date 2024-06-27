function loadScene1() {
    const svg = d3.select("#scene")
        .append("svg")
        .attr("width", 800)
        .attr("height", 600);

    const data = [
        { category: "Total Deaths", value: 12303828 },
        { category: "COVID-19 Deaths", value: 1146687 },
        { category: "Pneumonia Deaths", value: 1162833 },
        { category: "Influenza Deaths", value: 22226 }
    ];

    const xScale = d3.scaleBand()
        .domain(data.map(d => d.category))
        .range([0, 800])
        .padding(0.4);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .range([600, 0]);

    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.category))
        .attr("y", d => yScale(0))
        .attr("width", xScale.bandwidth())
        .attr("height", 0)
        .attr("fill", "steelblue")
        .transition()
        .duration(800)
        .attr("y", d => yScale(d.value))
        .attr("height", d => 600 - yScale(d.value));

    svg.append("g")
        .attr("transform", "translate(0,600)")
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Add annotations
    const annotations = [
        { note: { label: "Total deaths in the dataset", title: "Total Deaths" }, x: 100, y: 100 },
        { note: { label: "Deaths due to COVID-19", title: "COVID-19 Deaths" }, x: 300, y: 300 }
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
