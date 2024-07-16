function loadScene3() {
    console.log('Loading Scene 3');
    const svg = d3.select("#scene")
        .append("svg")
        .attr("width", 800)
        .attr("height", 600);

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

    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.ageGroup))
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

    // Add axis labels
    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(400,630)")
        .text("Age Group");

    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(-50,300)rotate(-90)")
        .text("COVID-19 Deaths");

    // Add title
    svg.append("text")
        .attr("class", "title-text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(400,50)")
        .text("COVID-19 Deaths by Age Group");

    // Add annotations
    const annotations = [
        { note: { label: "Highest deaths in older age groups", title: "Key Observation" }, x: 400, y: 200 }
    ];

    const makeAnnotations = d3.annotation()
        .type(d3.annotationLabel)
        .annotations(annotations);

    svg.append("g")
        .call(makeAnnotations);
}
