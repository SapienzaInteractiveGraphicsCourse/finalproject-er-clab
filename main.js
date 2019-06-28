"use strict";

// Vars
const sunId = 0;
const mercuryId = 1;
const venusId = 2;
const earthId = 3;
const marsId = 4;
const jupiterId = 5;
const saturnId = 6;
const uranusId = 7;
const neptuneId = 8;
const plutoId = 9;
const moonId = 10;
const saturnRingId = 11;
const planetSegments = 48;
const data = [
    {
        size: 5,
        color: 'img/sunColorMap.jpg'
    },
    {
        size: 1/2.54,
        distanceFromSun: 10,
        orbitRate: 0.24,
        rotationRate: 0.015,
        color: 'img/mercuryColorMap.jpg',
        bump: 'img/mercuryBumpMap.jpg'
    },
    {
        size: 1/1.05,
        distanceFromSun: 17.5,
        orbitRate: 0.62,
        rotationRate: 0.015,
        color: 'img/venusColorMap.jpg',
        bump: 'img/venusBumpMap.jpg'
    },
    {
        size: 1,
        distanceFromSun: 25,
        orbitRate: 365.2564,
        rotationRate: 0.015,
        color: 'img/earthColorMap.jpg',
        bump: 'img/earthBumpMap.jpg',
        specular: 'img/earthSpecularMap.jpg',
        cloud: 'img/earthCloudMap.jpg'
    },
    {
        size: 1/1.88,
        distanceFromSun: 40,
        orbitRate: 1.88,
        rotationRate: 0.015,
        color: 'img/marsColorMap.jpg',
        bump: 'img/marsBumpMap.jpg',
        normal: 'img/marsNormalMap.jpg'
    },
    {
        size: 2.7,
        distanceFromSun: 65,
        orbitRate: 2,
        rotationRate: 0.015,
        color: 'img/jupiterColorMap.jpg'
    },
    {
        size: 2.14,
        distanceFromSun: 125,
        orbitRate: 3,
        rotationRate: 0.015,
        ringInnerDiameter: 2.5,
        ringOuterDiameter: 3.5,
        ringSegments: 500,
        color: 'img/saturnColorMap.jpg',
        ring: 'img/saturnRingColor.jpg'
    },
    {
        size: 1,
        distanceFromSun: 245,
        orbitRate: 4,
        rotationRate: 0.015,
        color: 'img/uranusColorMap.jpg',
        ring: 'img/uranusRingColor.jpg'
    },
    {
        size: 1.94,
        distanceFromSun: 485,
        orbitRate: 5,
        rotationRate: 0.015,
        color: 'img/neptuneColorMap.jpg'
    },
    {
        size: 1/0.555,
        distanceFromSun: 965,
        orbitRate: 6,
        rotationRate: 0.015,
        color: 'img/plutoColorMap.jpg',
        bump: 'img/plutoBumpMap.jpg'
    }
];
data[moonId] =
{
    orbitRate: 29.5,
    rotationRate: 0.01,
    distanceFromSun: data[earthId].distanceFromSun + 1.5,
    size: 0.2728,
    color: 'img/moonColorMap.jpg',
    bump: 'img/moonBumpMap.jpg'
};

var clock = new THREE.Clock();

var scene, camera, renderer, controls;
var solarSystem, earthSystem;
var planets = [];

var textureloader = new THREE.TextureLoader();

function createPlanet(Id) {
    var geometry = new THREE.SphereGeometry(data[Id].size, planetSegments, planetSegments);
    var texture = textureloader.load(data[Id].color);
    var planetBump = null;
    if(data[Id].bump) planetBump = textureloader.load(data[Id].bump);
    var specMap = null;
    if(data[Id].specular) specMap = textureloader.load(data[Id].specular);
    var norMap = null;
    if(data[Id].normal) norMap = textureloader.load(data[Id].normal);
    var material = new THREE.MeshPhongMaterial({
        shininess: 20,
        map: texture,
        bumpMap: planetBump,
        specularMap: specMap,
        normalMap: norMap
    });
    planets[Id] = new THREE.Mesh(geometry, material);
    planets[Id].position.set(data[Id].distanceFromSun, 0, 0);
    solarSystem.add(planets[Id]);
    if(Id == earthId) createPlanet(moonId);
    else if(Id == saturnId) {
        var ringGeometry = new THREE.RingGeometry(data[saturnId].ringInnerDiameter, data[saturnId].ringOuterDiameter, data[saturnId].ringSegments);
        var ringTexture = textureloader.load(data[saturnId].saturnRingColor);
        var ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x757064,
            side: THREE.DoubleSide
        });
        planets[saturnRingId] = new THREE.Mesh(ringGeometry, ringMaterial);
        planets[saturnRingId].position.set(data[saturnId].distanceFromSun, 0, 0);
        planets[saturnRingId].rotation.x = Math.PI/2;
        solarSystem.add(planets[saturnRingId]);
    }
}

function rotationPlanet(Id, time) {
    planets[Id].rotation.y += data[Id].rotationRate;
    planets[Id].position.x = Math.cos(time * (1.0/(data[Id].orbitRate * 200)) + 10.0) * data[Id].distanceFromSun;
    planets[Id].position.z = Math.sin(time * (1.0/(data[Id].orbitRate * 200)) + 10.0) * data[Id].distanceFromSun;
    if(Id == moonId) {
        planets[Id].position.x += planets[earthId].position.x;
        planets[Id].position.z += planets[earthId].position.z;
    }
    else if(Id == saturnId) {
        planets[saturnRingId].position.x = Math.cos(time * (1.0/(data[Id].orbitRate * 200)) + 10.0) * data[Id].distanceFromSun;
        planets[saturnRingId].position.z = Math.sin(time * (1.0/(data[Id].orbitRate * 200)) + 10.0) * data[Id].distanceFromSun;
    }
}

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.z = 100;
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("container").appendChild( renderer.domElement );
    controls = new THREE.OrbitControls(camera);

    solarSystem = new THREE.Group();
    scene.add(solarSystem);

    var pointLight = new THREE.PointLight("rgb(255, 220, 180)", 1.5);
    pointLight.castShadow = true;
    pointLight.shadow.bias = 0.001;
    pointLight.shadow.mapSize.width = 2048;
    pointLight.shadow.mapSize.height = 2048;
    scene.add(pointLight);

    // Create light that is viewable from all directions.
    var ambientLight = new THREE.AmbientLight(0xaaaaaa);
    scene.add(ambientLight);

    var geometry = new THREE.SphereGeometry(data[sunId].size, 48, 48 );
	var texture = textureloader.load(data[sunId].color);
    var material = new THREE.MeshBasicMaterial({
        map: texture
    });
    planets[sunId] = new THREE.Mesh(geometry, material);
    solarSystem.add(planets[sunId]);
    createPlanet(mercuryId);
    createPlanet(venusId);
    createPlanet(earthId);
    createPlanet(marsId);
    createPlanet(jupiterId);
    createPlanet(saturnId);
    createPlanet(uranusId);
    createPlanet(neptuneId);
    createPlanet(plutoId);

    var stars = textureloader.load('./img/stars.jpg');
    scene.background = stars;
}

function render () {
    requestAnimationFrame(render);
    var time = Date.now();
    for(let i = mercuryId; i <= moonId; i++) rotationPlanet(i, time);
    controls.update();
    renderer.render(scene, camera);
}

init();
render();
