let currentScene = 1;

function loadScene(sceneNumber) {
    d3.select("#scene").html(""); // Clear current scene
    if (sceneNumber === 1) {
        loadScene1();
    } else if (sceneNumber === 2) {
        loadScene2();
    } else if (sceneNumber === 3) {
        loadScene3();
    }
}

function nextScene() {
    currentScene = (currentScene % 3) + 1;
    loadScene(currentScene);
}

function prevScene() {
    currentScene = (currentScene - 2 + 3) % 3 + 1;
    loadScene(currentScene);
}

// Add navigation buttons
document.getElementById('nextButton').addEventListener('click', nextScene);
document.getElementById('prevButton').addEventListener('click', prevScene);

// Load initial scene
loadScene(currentScene);
