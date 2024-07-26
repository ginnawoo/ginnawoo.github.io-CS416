function initScenes(data) {
    console.log('Initializing scenes...');
    createScene1(data);
    createScene2(data);
    createScene3(data);
    console.log('Scenes initialized.');
}

function createScene1(data) {
    console.log('Creating Scene 1...');
    const scene = d3.select('#visualization').append('div').attr('id', 'scene-1').attr('class', 'scene active');

    // Add title and paragraph
    scene.append('h1').text('Global Wealth Distribution: A Deep Dive into Billionaire Demographics and Industry Insights');
    scene.append('p').text('This narrative visualization explores the trends and distribution of billionaire demographics and wealth over time, across different countries, and by industry. It aims to uncover key insights into how billionaire wealth has evolved, the geographical distribution of wealth, and which industries have the highest concentration of billionaires.');

    scene.append('h2').text('Trends in Billionaire Demographics and Wealth Over Time');
    scene.append('p').text('This chart tracks changes in billionaire demographics and wealth over the years. The blue line represents the average net worth of billionaires, while the red line shows the number of billionaires.');


    // Tooltip instruction with image
    const tooltipInstruction = scene.append('div').attr('class', 'tooltip-instruction');
    tooltipInstruction.append('img').attr('src', 'data/tooltip-icon.png').attr('class', 'tooltip-icon').attr('alt', 'Tooltip Icon');
    tooltipInstruction.append('p').text('Hover over the lines in the chart to get more insights.');


    const margin = { top: 20, right: 60, bottom: 50, left: 60 };
    const width = 960 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    const svg = scene.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Parse the data
    const parseYear = d3.timeParse("%Y");
    data.forEach(d => {
        if (d.birthYear) {
            d.birthYear = parseYear(d.birthYear);
        }
    });

    // Filter out invalid data
    const filteredData = data.filter(d => d.birthYear);

    // Group and aggregate the data
    const yearGroup = d3.group(filteredData, d => d.birthYear.getFullYear());
    const yearData = Array.from(yearGroup, ([year, values]) => ({
        year: parseYear(year),
        averageNetWorth: d3.mean(values, d => +d.finalWorth),
        count: values.length
    }));

    // Sort yearData by year
    yearData.sort((a, b) => a.year - b.year);

    // Scales
    const x = d3.scaleTime()
        .domain(d3.extent(yearData, d => d.year))
        .range([0, width]);

    const yLeft = d3.scaleLinear()
        .domain([0, d3.max(yearData, d => d.averageNetWorth)]).nice()
        .range([height, 0]);

    const yRight = d3.scaleLinear()
        .domain([0, d3.max(yearData, d => d.count)]).nice()
        .range([height, 0]);

    // Axes
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(10).tickFormat(d3.timeFormat("%Y")));

    svg.append('g')
        .attr('class', 'y-axis-left')
        .call(d3.axisLeft(yLeft).ticks(10).tickFormat(d3.format("$.2s")));

    svg.append('g')
        .attr('class', 'y-axis-right')
        .attr('transform', `translate(${width},0)`)
        .call(d3.axisRight(yRight).ticks(10));

    // Lines
    svg.append('path')
        .datum(yearData)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 2)
        .attr('d', d3.line()
            .curve(d3.curveBasis)
            .x(d => x(d.year))
            .y(d => yLeft(d.averageNetWorth))
        );

    svg.append('path')
        .datum(yearData)
        .attr('fill', 'none')
        .attr('stroke', 'red')
        .attr('stroke-width', 2)
        .attr('d', d3.line()
            .curve(d3.curveBasis)
            .x(d => x(d.year))
            .y(d => yRight(d.count))
        );

    // Legends
    svg.append('text')
        .attr('x', width - 200)
        .attr('y', 30)
        .attr('fill', 'steelblue')
        .text('Average Net Worth');

    svg.append('text')
        .attr('x', width - 200)
        .attr('y', 50)
        .attr('fill', 'red')
        .text('Number of Billionaires');

    // Labels
    svg.append('text')
        .attr('transform', `translate(${width / 2},${height + margin.bottom - 10})`)
        .style('text-anchor', 'middle')
        .text('Year');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Average Net Worth (USD Billion)');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', width + margin.right - 20)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Number of Billionaires');

    // Adding tooltips
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    svg.selectAll('path')
        .on('mouseover', function (event, d) {
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
        })
        .on('mousemove', function (event, d) {
            const year = x.invert(d3.pointer(event)[0]);
            const data = yearData.find(data => data.year.getFullYear() === year.getFullYear());
            tooltip.html(`
                <strong>Year: ${data.year.getFullYear()}</strong><br/>
                Average Net Worth: $${data.averageNetWorth.toFixed(2)} Billion<br/>
                Number of Billionaires: ${data.count}
            `)
                .style('left', (event.pageX + 15) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function () {
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });

    // Adding annotations
    const annotations = [
        {
            note: { label: 'Peak average net worth', title: 'Around 1960' },
            x: x(yearData.find(d => d.year.getFullYear() === 1960)?.year),
            y: yLeft(yearData.find(d => d.year.getFullYear() === 1960)?.averageNetWorth),
            dy: -50,
            dx: 50
        },
        {
            note: { label: 'Highest number of billionaires', title: 'Around 1980' },
            x: x(yearData.find(d => d.year.getFullYear() === 1980)?.year),
            y: yRight(yearData.find(d => d.year.getFullYear() === 1980)?.count),
            dy: -50,
            dx: 50
        },
    ].filter(d => d.x && d.y);

    const makeAnnotations = d3.annotation()
        .annotations(annotations);

    svg.append('g')
        .call(makeAnnotations);

    console.log('Scene 1 created.');

    // Add analysis text at the bottom
    scene.append('div')
        .attr('class', 'analysis')
        .style('margin-top', '20px')
        .html(`
         <h3>Analysis</h3>
         <p>The trends in billionaire demographics and wealth over time reveal significant patterns. The average net worth of billionaires peaked around 1960, which might be attributed to various economic factors at that time. The number of billionaires saw a significant increase around 1980, likely due to globalization and the tech boom. This visualization helps us understand the historical context and the factors that influenced the wealth distribution among billionaires.</p>
     `);

    // Add data source information
    scene.append('div')
        .attr('class', 'data-source')
        .style('font-size', '10px')
        .style('text-align', 'center')
        .style('margin-top', '10px')
        .html(`Data Source: <a href="https://www.kaggle.com/datasets/nelgiriyewithana/billionaires-statistics-dataset?resource=download" target="_blank">Kaggle Billionaires Statistics Dataset</a>`);
}

function createScene2(data) {
    console.log('Creating Scene 2...');
    const scene = d3.select('#visualization').append('div').attr('id', 'scene-2').attr('class', 'scene');

    // Add title and paragraph
    scene.append('h1').text('Global Wealth Distribution: A Deep Dive into Billionaire Demographics and Industry Insights');
    scene.append('p').text('This narrative visualization explores the trends and distribution of billionaire demographics and wealth over time, across different countries, and by industry. It aims to uncover key insights into how billionaire wealth has evolved, the geographical distribution of wealth, and which industries have the highest concentration of billionaires.');

    scene.append('h2').text('Distribution of Billionaires by Country').style('margin-bottom', '20px');
    scene.append('p').text('This chart shows the distribution of billionaires by country, with the size of the bubbles representing the number of billionaires, and the color representing different countries.');

    // Tooltip instruction with image
    const tooltipInstruction = scene.append('div').attr('class', 'tooltip-instruction');
    tooltipInstruction.append('img').attr('src', 'data/tooltip-icon.png').attr('class', 'tooltip-icon').attr('alt', 'Tooltip Icon');
    tooltipInstruction.append('p').text('Use the filters on the right to select specific industries and countries. Click "Apply Filters" to update the visualization based on your selections. Make sure deselect "ALL" checkbox before filtering. Simply click the "Reset" button to reset.');

    // Tooltip instruction for chart with image
    const barChartTooltipInstruction = scene.append('div').attr('class', 'tooltip-instruction');
    barChartTooltipInstruction.append('img').attr('src', 'data/tooltip-icon.png').attr('class', 'tooltip-icon').attr('alt', 'Tooltip Icon');
    barChartTooltipInstruction.append('p').text('Hover over the circles in the graph to get more insights.');

    const margin = { top: 100, right: 350, bottom: 50, left: 100 };
    const width = 1200 - margin.left - margin.right; // Increased width
    const height = 800 - margin.top - margin.bottom; // Increased height

    const svg = scene.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Prepare the data for the bubble chart
    const countryGroup = d3.group(data, d => d.country);
    const countryData = Array.from(countryGroup, ([country, values]) => ({
        country: country,
        count: values.length,
        netWorth: d3.mean(values, d => +d.finalWorth),
        age: d3.mean(values, d => +d.age),
        topBillionaire: values.reduce((prev, current) => (+prev.finalWorth > +current.finalWorth) ? prev : current).personName
    }));

    const x = d3.scaleLinear()
        .domain([0, d3.max(countryData, d => d.netWorth)])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(countryData, d => d.age)])
        .range([height, 0]);

    const size = d3.scaleSqrt()
        .domain([0, d3.max(countryData, d => d.count)])
        .range([0, 50]); // Adjust the range to control the size of the bubbles

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(10).tickFormat(d3.format("$.2s")));

    svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y).ticks(10));

    const tooltip = d3.select('#visualization').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background', '#f4f4f4')
        .style('padding', '10px')
        .style('border', '1px solid #d4d4d4')
        .style('border-radius', '5px');

    svg.selectAll('.bubble')
        .data(countryData)
        .enter().append('circle')
        .attr('class', 'bubble')
        .attr('cx', d => x(d.netWorth))
        .attr('cy', d => y(d.age))
        .attr('r', d => size(d.count))
        .style('fill', d => color(d.country))
        .on('mouseover', (event, d) => {
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip.html(`
                <strong>${d.country}</strong><br/>
                Net Worth: $${d.netWorth.toFixed(2)} Billion<br/>
                Average Age: ${d.age.toFixed(2)}<br/>
                Count: ${d.count}<br/>
                Top Billionaire: ${d.topBillionaire}
            `)
                .style('left', (event.pageX + 15) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', d => {
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });

    svg.append('text')
        .attr('transform', `translate(${width / 2},${height + margin.bottom - 10})`)
        .style('text-anchor', 'middle')
        .text('Net Worth (USD Billion)');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Average Age');

    // Find the country with the highest number of billionaires and the oldest average age
    const maxBillionaires = countryData.reduce((prev, current) => (prev.count > current.count) ? prev : current);
    const oldestAverageAge = countryData.reduce((prev, current) => (prev.age > current.age) ? prev : current);

    // Adding annotations
    const annotations = [
        {
            note: { label: 'Highest number of billionaires' },
            x: x(maxBillionaires.netWorth),
            y: y(maxBillionaires.age),
            dy: -100,
            dx: 100
        },
        {
            note: { label: 'Country with oldest average age' },
            x: x(oldestAverageAge.netWorth),
            y: y(oldestAverageAge.age),
            dy: -50,
            dx: -50
        },
    ];

    const makeAnnotations = d3.annotation()
        .annotations(annotations)
        .type(d3.annotationLabel)
        .accessors({
            x: d => d.x,
            y: d => d.y
        })
        .accessorsInverse({
            x: d => x(d.netWorth),
            y: d => y(d.age)
        });

    svg.append('g')
        .attr('class', 'annotation-group')
        .call(makeAnnotations);

    console.log('Scene 2 created.');

    // Add analysis text at the bottom
    scene.append('div')
        .attr('class', 'analysis')
        .style('margin-top', '20px')
        .html(`
            <h3>Analysis</h3>
            <p>The distribution of billionaires by country reveals interesting insights. The United States has the highest number of billionaires, which can be attributed to its large economy and favorable business environment. Japan, on the other hand, has the oldest average age of billionaires, indicating that wealth in Japan may be more concentrated among older individuals. The size of the bubbles represents the number of billionaires in each country, with larger bubbles indicating a higher count. This visualization highlights the global distribution of wealth and the disparities between countries in terms of both the number and average age of billionaires.</p>
        `);

    // Add data source information
    scene.append('div')
        .attr('class', 'data-source')
        .style('font-size', '10px')
        .style('text-align', 'center')
        .style('margin-top', '10px')
        .html(`Data Source: <a href="https://www.kaggle.com/datasets/nelgiriyewithana/billionaires-statistics-dataset?resource=download" target="_blank">Kaggle Billionaires Statistics Dataset</a>`);
}


function createScene3(data) {
    console.log('Creating Scene 3...');
    const scene = d3.select('#visualization').append('div').attr('id', 'scene-3').attr('class', 'scene');

    // Add title and paragraph
    scene.append('h1').text('Global Wealth Distribution: A Deep Dive into Billionaire Demographics and Industry Insights');
    scene.append('p').text('This narrative visualization explores the trends and distribution of billionaire demographics and wealth over time, across different countries, and by industry. It aims to uncover key insights into how billionaire wealth has evolved, the geographical distribution of wealth, and which industries have the highest concentration of billionaires.');

    scene.append('h2').text('Billionaires by Industry');
    scene.append('p').text('This chart shows the number of billionaires in each industry. The bar height represents the number of billionaires in that industry.');

    // Tooltip instruction with image
    const tooltipInstruction = scene.append('div').attr('class', 'tooltip-instruction');
    tooltipInstruction.append('img').attr('src', 'data/tooltip-icon.png').attr('class', 'tooltip-icon').attr('alt', 'Tooltip Icon');
    tooltipInstruction.append('p').text('Use the filters on the right to select specific industries and countries. Click "Apply Filters" to update the visualization based on your selections. Make sure deselect "ALL" checkbox before filtering. Simply click the "Reset" button to reset.');

    // Tooltip instruction for bar chart with image
    const barChartTooltipInstruction = scene.append('div').attr('class', 'tooltip-instruction');
    barChartTooltipInstruction.append('img').attr('src', 'data/tooltip-icon.png').attr('class', 'tooltip-icon').attr('alt', 'Tooltip Icon');
    barChartTooltipInstruction.append('p').text('Hover over the bars in the graph to get more insights.');

    const margin = { top: 50, right: 100, bottom: 100, left: 60 }; // Increased bottom margin
    const width = 1200 - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom;
    const svg = scene.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom + 50) // Add extra height to the SVG
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const industryCount = d3.rollup(data, v => v.length, d => d.industries);
    const industryData = Array.from(industryCount, ([industry, count]) => {
        const names = data.filter(d => d.industries === industry).map(d => d.personName);
        return { industry, count, names };
    });

    const x = d3.scaleBand()
        .domain(industryData.map(d => d.industry))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(industryData, d => d.count)]).nice()
        .range([height, 0]);

    const color = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, d3.max(industryData, d => d.count)]);

    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).tickSize(0).tickPadding(10))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

    svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y).ticks(10));

    svg.selectAll('.bar')
        .data(industryData)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.industry))
        .attr('y', d => y(d.count))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.count))
        .attr('fill', d => color(d.count))
        .on('mouseover', function (event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('fill', d3.rgb(color(d.count)).darker(2));
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip.html(`${d.industry}: ${d.count}<br>Example Billionaires: ${d.names.slice(0, 3).join(', ')}`)
                .style('left', (event.pageX + 5) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function (event, d) {
            d3.select(this)
                .transition()
                .duration(500)
                .attr('fill', color(d.count));
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });

    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    svg.append('text')
        .attr('transform', `translate(${width / 2},${height + margin.bottom - 5})`) // Adjusted position
        .style('text-anchor', 'middle')
        .text('Industry');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Number of Billionaires');

    // Find the industry with the highest and lowest number of billionaires
    const maxIndustry = industryData.reduce((prev, current) => (prev.count > current.count) ? prev : current);
    const minIndustry = industryData.reduce((prev, current) => (prev.count < current.count) ? prev : current);

    // Adding annotations
    const annotations = [
        {
            note: {
                label: `Highest number of billionaires`,
                wrap: 200
            },
            connector: {
                end: "arrow",
                type: "line",
                points: [[x(maxIndustry.industry) + x.bandwidth() / 2, y(maxIndustry.count)]]
            },
            x: x(maxIndustry.industry) + x.bandwidth() / 2,
            y: y(maxIndustry.count),
            dy: -50,
            dx: 30,
            color: 'red'
        },
        {
            note: {
                label: `Lowest number of billionaires`,
                wrap: 200
            },
            connector: {
                end: "arrow",
                type: "line",
                points: [[x(minIndustry.industry) + x.bandwidth() / 2, y(minIndustry.count)]]
            },
            x: x(minIndustry.industry) + x.bandwidth() / 2,
            y: y(minIndustry.count),
            dy: -50,
            dx: 30,
            color: 'blue'
        },
    ];

    const makeAnnotations = d3.annotation()
        .annotations(annotations)
        .type(d3.annotationLabel)
        .accessors({
            x: d => d.x,
            y: d => d.y
        });

    svg.append('g')
        .call(makeAnnotations);

    console.log('Scene 3 created.');

    // Add analysis text at the bottom
    scene.append('div')
        .attr('class', 'analysis')
        .style('margin-top', '0px') // Reduced margin-top
        .html(`
        <h3>Analysis</h3>
        <p>The analysis of billionaires by industry highlights the concentration of wealth in specific sectors. The technology and finance & investment industries have the highest number of billionaires, reflecting the significant growth and opportunities in these fields. On the other hand, industries such as casinos & gambling have the lowest number of billionaires. This visualization sheds light on the sectors that dominate the billionaire landscape and those that are less represented.</p>
    `);

    // Add data source information
    scene.append('div')
        .attr('class', 'data-source')
        .style('font-size', '10px')
        .style('text-align', 'center')
        .style('margin-top', '20px') // Increased margin-top
        .style('margin-bottom', '20px') // Increased margin-bottom
        .html(`Data Source: <a href="https://www.kaggle.com/datasets/nelgiriyewithana/billionaires-statistics-dataset?resource=download" target="_blank">Kaggle Billionaires Statistics Dataset</a>`);
}

