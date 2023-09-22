
// Create a map
let map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM(),
    }),
  ],
  view: new ol.View({
    projection: 'EPSG:4326',
    center: [74.85800619650306, 32.72489242670541],
    zoom: 14,
  }),
});

let sourceMarker = null;
let destinationMarker = null;
let souceCo = null;
let destinCo = null;
let routeLayer = null;
map.on('click', async function (event) {
  const coordinates = event.coordinate;
  try {
      if (!sourceMarker) {
        souceCo = coordinates;
        sourceMarker = new ol.Feature({
          geometry: new ol.geom.Point(coordinates),
        });
        sourceMarker.setStyle(new ol.style.Style({
          image: new ol.style.Icon({
            src: 'img/source.png', 
            scale: 0.03// Replace with your source marker icon
          }),
        }));
        
        const sourceMarkerLayer = new ol.layer.Vector({
          source: new ol.source.Vector({
            features: [sourceMarker],
          }),
        });
        map.addLayer(sourceMarkerLayer);
      } 

     else {
      if(!destinationMarker){
        destinCo = coordinates;
        destinationMarker = new ol.Feature({
          geometry: new ol.geom.Point(coordinates),
        });
        destinationMarker.setStyle(new ol.style.Style({
          image: new ol.style.Icon({
            src: 'img/source.png', 
            scale: 0.03
          }),
        }));
        
        const destinationMarkerLayer = new ol.layer.Vector({
          source: new ol.source.Vector({
            features: [destinationMarker],
          }),
        });
        map.addLayer(destinationMarkerLayer);
      } else{
        destinationMarker.getGeometry().setCoordinates(coordinates);
        findVertexId(souceCo, destinCo);
      }
    }
    findVertexId(souceCo,destinCo);
      // Call the function to find the destination vertex and calculate the route
      
    }
  catch (error) {
    console.log(error);
    alert(error);
  }
});


async function findVertexId(...data) {
  try {
    let url_1 = `http://localhost:3906/akashApi/getFirstVertex?lat=${data[0][1]}&lng=${data[0][0]}`;
    let url_2 = `http://localhost:3906/akashApi/getSecondVertex?lat=${data[1][1]}&lng=${data[1][0]}`;

    let responseVrtx1 = await fetch(url_1);
    let responseVrtx2 = await fetch(url_2);
    let dataVtx1 = await responseVrtx1.json();
    let dataVtx2 = await responseVrtx2.json();

    if (dataVtx1.status == 'OK' && dataVtx2.status == 'OK') {
      let targetId = dataVtx1.data.features[0].properties.id;
      let destinationId = dataVtx2.data.features[0].properties.id;
      await calculateAndDisplayRoute(targetId, destinationId)
    }
  } catch (error) {
    console.log(error)
  }

}
async function calculateAndDisplayRoute(...sourcedestID) {
  try {
    let routeUrl = `http://localhost:3906/akashApi/getRouteUsingVertex?ver1=${sourcedestID[0]}&ver2=${sourcedestID[1]}`;
    let response = await fetch(routeUrl);
    let data = await response.json();

    if (data.status === 'OK') {
      let features = [];
      data.data.features.forEach(fet => {
        let routeFeature = new ol.Feature({
          geometry: new ol.geom.MultiLineString(fet.geometry.coordinates),
        });
        features.push(routeFeature);
      });
      
      let routeLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
          features: features,
        }),
        style: new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: '#F31559',
            width: 8,
          }),
        }),
      });

      map.addLayer(routeLayer);

    } else {
      alert('Error: Unable to fetch the route.');
    }
  } catch (error) {
    console.log(error)
    alert(error);

  }
}

function clearRoute() {
  if (routeLayer) {
    map.removeLayer(routeLayer);
  }
    
    destinationMarker = null;
}






