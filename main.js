"use strict";

// Planet data
const data = loadData();

// Scene variables
var scene, camera, renderer, controls, raycaster;

// Far camera parameter
var far = 10000;

// Date
var date;

// Planets array
var celestialObjects = [];

// Orbits array
var orbits = [];

// Light of the sunId
var sunLight;

// Ambient light
var ambientLight;

// Texture Loader
var textureLoader;

// Play or pause the animation
var play;

// Play or pause rotation
var playRotationMovement;

// Play or pause revolution
var playRevolutionMovement;

// Incline orbit
var inclinedOrbit;

// Speed factor
var speedFactor = 1.0;

// Mouse
var mouse;

// Tooltip
var tooltipDiv;

// Sound vars
var sound, audioListener, audioLoader;
var volume = 0.3;
var tracks = ['sounds/ambient.ogg', 'sounds/strangerThings.ogg'];
var sounds = [];

// Follow planet
var followPlanetId = sunId;
var cameraFollowsPlanet = true;

// Initialize
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, far);
    camera.position.y = 45;
    camera.position.z = 100;
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    raycaster = new THREE.Raycaster();
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("container").appendChild(renderer.domElement);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    controls = new THREE.OrbitControls(camera, document.getElementById("container"));
    controls.autoRotateSpeed = 1;

    // Current date
    date = new Date();

    // Animation flags
    play = true;
    playRotationMovement = true;
    playRevolutionMovement = true;

	// Inclined orbit flag
	inclinedOrbit = true;

    // Texture loader
    textureLoader = new THREE.TextureLoader();

    // Tooltip div
    tooltipDiv = $("#tooltip");

	// Create the sun
    createSun();

    // Create planets
    for (let i = mercuryId; i <= moonId; i++) createPlanet(i);

    // Create asteroid belt
    createAsteroidBelt();

    // Create Earth clouds
    createEarthCloud();

    // Stars background
    scene.background = createStars('./img/stars.jpg');

    // Create light viewable from all directions.
    scene.add(new THREE.AmbientLight(0x222222));
    ambientLight = new THREE.AmbientLight(0xaaaaaa);

    // Create an AudioListener and add it to the camera
    audioListener = new THREE.AudioListener();
    camera.add(audioListener);

    // Add ambient music
    ambientMusic();

    // Initialize mouse
    mouse = new THREE.Vector2();
}

// Update animation
function render () {
    requestAnimationFrame(render);
    for (let i = sunId; i <= moonId; i++) movePlanet(i); // Animate planets
    if (play) incrementDate(); // Increment date
    let theta = THREE.Math.degToRad(360) * (date.getTime() / (data[asteroidBeltId].revolutionRate * 86400000)); // Asteroid belt rotation angle
    if (playRevolutionMovement) celestialObjects[asteroidBeltId].rotation.y = theta; // Rotate asteroid belt
    if (cameraFollowsPlanet) followPlanet(followPlanetId); // Follow target planet
    controls.update();
    renderer.render(scene, camera);
}

init();

// Listener for initial loading page
window.onload = function() {
    document.getElementById("loading").style.display = "none";
	render();
}
