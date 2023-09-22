// Create a map
let map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM(),
        }),
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([77.09667807902194, 28.571101381602933]),
        zoom: 10,
    }),
});

let sourceCoordinates = [77.2042788412794, 28.54831392212583];

let currentSource = sourceCoordinates.slice(); // Start with the original source coordinates

let facilities = [
    [77.40841518368636, 28.54124732134948],
    [77.21936190961137, 28.63298702120774],
    [77.08226497169757, 28.46750607962668],
    [77.08157192656734, 28.741319015483622],
    [77.31571804031307, 28.394265894492264],
    [77.21006096260645, 28.64148393655871]
    // Add more facility coordinates as needed
];

function addSourceAndDestinationMarkers(sourceCoords, destinationCoords) {
    let markers = [];

    // Add source marker
    let sourceMarker = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat(sourceCoords)),
    });
    sourceMarker.setStyle(new ol.style.Style({
        image: new ol.style.Icon({
            src: 'img/source.png',
            scale: 0.03,
        }),
    }));
    markers.push(sourceMarker);

    // Add destination marker
    let destinationMarker = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat(destinationCoords)),
    });
    markers.push(destinationMarker);

    let markerSource = new ol.source.Vector({
        features: markers,
    });

    let markerLayer = new ol.layer.Vector({
        source: markerSource,
    });

    map.addLayer(markerLayer);
}

function findClosestFacility(sourceCoords, facilities) {
    let closestFacility = null;
    let closestDistance = Infinity;

    for (let facility of facilities) {
        let distance = turf.distance(turf.point(sourceCoords), turf.point(facility), { units: 'kilometers' });
        if (distance < closestDistance) {
            closestDistance = distance;
            closestFacility = facility;
        }
    }
    return closestFacility;
}

async function calculateAndDisplayRoute(sourceCoords, destinationCoords) {
    try {
        let osrmBaseUrl = `http://router.project-osrm.org/route/v1/driving/`;
        let coordinatesString = `${sourceCoords.join(',')};${destinationCoords.join(',')}`;
        let routeUrl = `${osrmBaseUrl}${coordinatesString}?overview=false&alternatives=false&steps=true&hints=;`;

        let response = await fetch(routeUrl);
        let data = await response.json();

        if (data.code === 'Ok') {
            let routeCoordinates = data.routes[0].legs[0].steps;

            let randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
            let routeFeature = new ol.Feature({
                geometry: new ol.geom.LineString(routeCoordinates.map(coord => ol.proj.fromLonLat(coord.intersections[0].location))),
            });

            // Create a layer for the route
            let routeLayer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: [routeFeature],
                }),
                style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: randomColor,
                        width: 6,
                    }),
                }),
            });

            map.addLayer(routeLayer);

        } else {
            alert('Error: Unable to fetch the route.');
        }
    } catch (error) {
        alert('Error: Unable to fetch the route.');
        console.error(error);
    }
    addSourceAndDestinationMarkers(sourceCoords, destinationCoords);
}

function drawRoot() {
    while (facilities.length) {
        findRoutes()
    }
}

function findRoutes() {
    if (facilities.length === 0) {
        alert('All routes have been calculated.');
        routeLayer.setVisible(false);
        return;
    }

    let closestFacility = findClosestFacility(currentSource, facilities);
    if (closestFacility) {
        calculateAndDisplayRoute(currentSource, closestFacility);

        // Update currentSource to the closest facility for the next iteration
        currentSource = closestFacility.slice();

        // Remove the used facility from the facilities array
        let index = facilities.indexOf(closestFacility);
        if (index !== -1) {
            facilities.splice(index, 1);
        }
    } else {
        alert('No more facilities to route to.');
    }
}

// Initial marker setup
addSourceAndDestinationMarkers(sourceCoordinates, sourceCoordinates);
addFacilityMarkers(facilities);

// Function to add facility markers
function addFacilityMarkers(facilityCoords) {
    let markers = [];

    facilityCoords.forEach(coord => {
        let marker = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat(coord)),
        });

        markers.push(marker);
    });

    let markerSource = new ol.source.Vector({
        features: markers,
    });

    let markerLayer = new ol.layer.Vector({
        source: markerSource,
        style: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({ color: 'green' }), // You can customize the marker style here
            }),
        }),
    });

    map.addLayer(markerLayer);
}




