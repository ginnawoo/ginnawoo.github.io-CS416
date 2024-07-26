// Global variable to store the data
let originalData = [];
let currentScene = 1;
const totalScenes = 3;

document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContentLoaded event fired.');
    d3.csv('data/Billionaires Statistics Dataset.csv').then(function (data) {
        originalData = data; // Store the original data globally
        console.log('Billionaires data:', data);

        // Extract unique industries and countries for the filter checkboxes
        initializeFilters(data);

        // Initialize scenes with the original data
        initScenes(data);
        // Show the first scene by default
        showScene(1);
    }).catch(function (error) {
        console.error('Error loading data:', error);
    });
});

function initializeFilters(data) {
    // Extract unique industries
    const industries = Array.from(new Set(data.map(d => d.industries))).sort();
    const industryFilters = d3.select('#industry-filters');
    industryFilters.selectAll('label').remove(); // Clear existing labels
    industryFilters.append('label').html(`<input type="checkbox" value="ALL" class="industry-checkbox" checked> ALL`);
    industries.forEach(industry => {
        industryFilters.append('label')
            .html(`<input type="checkbox" value="${industry}" class="industry-checkbox"> ${industry}`);
    });

    // Extract unique countries
    const countries = Array.from(new Set(data.map(d => d.country))).sort();
    const countryFilters = d3.select('#country-filters');
    countryFilters.selectAll('label').remove(); // Clear existing labels
    countryFilters.append('label').html(`<input type="checkbox" value="ALL" class="country-checkbox" checked> ALL`);
    countries.forEach(country => {
        countryFilters.append('label')
            .html(`<input type="checkbox" value="${country}" class="country-checkbox"> ${country}`);
    });
}

function showScene(sceneNumber) {
    console.log('Showing scene:', sceneNumber);
    currentScene = sceneNumber;
    // Hide all scenes
    d3.selectAll('.scene').classed('active', false);
    // Show the selected scene
    d3.select(`#scene-${sceneNumber}`).classed('active', true);

    // Show filters only for Scene 2 and Scene 3
    if (sceneNumber === 2 || sceneNumber === 3) {
        d3.select('#filters').style('display', 'flex');
    } else {
        d3.select('#filters').style('display', 'none');
        d3.select('.no-data').remove(); // Remove the no data message if present
    }

    updateNavigationButtons();
}

function applyFilters() {
    const selectedIndustries = Array.from(document.querySelectorAll('.industry-checkbox:checked')).map(cb => cb.value);
    const selectedCountries = Array.from(document.querySelectorAll('.country-checkbox:checked')).map(cb => cb.value);

    console.log('Selected industries:', selectedIndustries);
    console.log('Selected countries:', selectedCountries);

    let filteredData = originalData;

    if (!selectedIndustries.includes('ALL')) {
        filteredData = filteredData.filter(d => selectedIndustries.includes(d.industries));
    }
    if (!selectedCountries.includes('ALL')) {
        filteredData = filteredData.filter(d => selectedCountries.includes(d.country));
    }

    // Remove existing scenes and the no data message
    d3.select('#scene-2').remove();
    d3.select('#scene-3').remove();
    d3.select('.no-data').remove();

    if (filteredData.length === 0) {
        if (currentScene === 2 || currentScene === 3) {
            showNoDataImage();
        }
    } else {
        createScene2(filteredData);
        createScene3(filteredData);
    }

    // Maintain the current scene
    showScene(currentScene);
}

function showNoDataImage() {
    const visualization = d3.select('#visualization');
    visualization.append('div')
        .attr('class', 'no-data')
        .style('text-align', 'center')
        .style('margin', '20px')
        .html('<img src="data/memeIcon.png" alt="No Data" style="max-width: 100%; height: auto;"><p>Uh oh! There are no data for the filters you applied! Try again!</p>');
}

function resetFilters() {
    d3.selectAll('.industry-checkbox, .country-checkbox').property('checked', true);
    // Remove existing scenes and the no data message
    d3.select('#scene-2').remove();
    d3.select('#scene-3').remove();
    d3.select('.no-data').remove(); // Remove the no data image if present

    createScene2(originalData);
    createScene3(originalData);

    // Maintain the current scene
    showScene(currentScene);
}

function showPreviousScene() {
    if (currentScene > 1) {
        showScene(currentScene - 1);
    }
}

function showNextScene() {
    if (currentScene < totalScenes) {
        showScene(currentScene + 1);
    }
}

function updateNavigationButtons() {
    // Disable "Previous" button if on the first scene
    if (currentScene === 1) {
        d3.select('#prev-button').attr('disabled', true);
    } else {
        d3.select('#prev-button').attr('disabled', null);
    }

    // Disable "Next" button if on the last scene
    if (currentScene === totalScenes) {
        d3.select('#next-button').attr('disabled', true);
    } else {
        d3.select('#next-button').attr('disabled', null);
    }
}

function initScenes(data) {
    console.log('Initializing scenes...');
    createScene1(originalData); // Scene 1 uses the original data
    createScene2(data); // Scene 2 uses the filtered data
    createScene3(data); // Scene 3 uses the filtered data
    console.log('Scenes initialized.');
}
