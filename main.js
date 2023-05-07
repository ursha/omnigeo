// import necessary modules
import Map from 'ol/Map.js';
import MousePosition from 'ol/control/MousePosition.js';
import ScaleBar from 'ol/control/ScaleLine.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import {createStringXY} from 'ol/coordinate.js';
import {defaults as defaultControls} from 'ol/control.js';
import XYZ from 'ol/source/XYZ.js';
import Draw from 'ol/interaction/Draw.js';
import {Circle, Polygon} from 'ol/geom.js';
import {Vector as VectorLayer} from 'ol/layer.js';
import {createRegularPolygon, createBox} from 'ol/interaction/Draw.js'
import {getArea, getLength} from 'ol/sphere.js';
import {unByKey} from 'ol/Observable.js';


///drawing
const source = new VectorSource({wrapX: false});
const vector = new VectorLayer({
  source: source,
});



// create the mouse position control
const mousePositionControl = new MousePosition({
  coordinateFormat: createStringXY(4),
  projection: 'EPSG:4326',
  // comment the following two lines to have the mouse position
  // be placed within the map.
  className: 'custom-mouse-position',
  target: document.getElementById('mouse-position'),
});
// create the scale bar control
const scaleBarControl = new ScaleBar({
  units: 'metric', // set the units for the scale bar
  bar: true, // set to true for a scale bar
  steps: 4, // set the number of steps in the scale bar
  text: true, // set to true to display the scale bar text
});

const map = new Map({
  controls: defaultControls().extend([mousePositionControl, scaleBarControl]),
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    vector,
  ],
  target: 'map',
  view: new View({
    center: [2666865.3349, 7374397.8447], 
    zoom: 5,
    projection: 'EPSG:3857', // set the projection for the view
  }),
});
// add an event listener for the basemap select dropdown
const basemapSelect = document.getElementById('basemap-select');
basemapSelect.addEventListener('change', function (event) {
  const selectedValue = event.target.value;
  let newLayerSource;

  if (selectedValue === 'satellite') {
    // replace the OSM source with a satellite source
    newLayerSource = new TileLayer({
      source: new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        tileSize: 512,
        maxZoom: 20,
      }),
    });
  } else if (selectedValue === 'CartoDb') {
    // replace the OSM source with a CartoDB source
    newLayerSource = new TileLayer({
      source: new XYZ({
        url: 'http://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      }),
    });
  } else if (selectedValue === 'Esri Gray (light)') {
    // replace the OSM source with a Esri Gray (light) source
    newLayerSource = new TileLayer({
      source: new XYZ({
        url: 'http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      }),
    });
  } else if (selectedValue === 'Esri Gray (dark)') {
    // replace the OSM source with a Esri Gray (light) source
    newLayerSource = new TileLayer({
      source: new XYZ({
        url: 'http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      }),
    });
  } else {
    // use the default OSM source
    newLayerSource = new TileLayer({
      source: new OSM(),
    });
  }

  // remove the old layer and add the new one
  map.getLayers().removeAt(0);
  map.getLayers().insertAt(0, newLayerSource);
});

//drawing shapres

const typeSelect = document.getElementById('type');

let draw; // global so we can remove it later
function addInteraction() {
  let value = typeSelect.value;
  if (value !== 'None') {
    let geometryFunction;
    if (value === 'Square') {
      value = 'Circle';
      geometryFunction = createRegularPolygon(4);
    } else if (value === 'Box') {
      value = 'Circle';
      geometryFunction = createBox();
    } else if (value === 'Star') {
      value = 'Circle';
      geometryFunction = function (coordinates, geometry) {
        const center = coordinates[0];
        const last = coordinates[coordinates.length - 1];
        const dx = center[0] - last[0];
        const dy = center[1] - last[1];
        const radius = Math.sqrt(dx * dx + dy * dy);
        const rotation = Math.atan2(dy, dx);
        const newCoordinates = [];
        const numPoints = 12;
        for (let i = 0; i < numPoints; ++i) {
          const angle = rotation + (i * 2 * Math.PI) / numPoints;
          const fraction = i % 2 === 0 ? 1 : 0.5;
          const offsetX = radius * fraction * Math.cos(angle);
          const offsetY = radius * fraction * Math.sin(angle);
          newCoordinates.push([center[0] + offsetX, center[1] + offsetY]);
        }
        newCoordinates.push(newCoordinates[0].slice());
        if (!geometry) {
          geometry = new Polygon([newCoordinates]);
        } else {
          geometry.setCoordinates([newCoordinates]);
        }
        return geometry;
      };
    }
    draw = new Draw({
      source: source,
      type: value,
      geometryFunction: geometryFunction,
    });
    map.addInteraction(draw);
  }
}

/**
 * Handle change event.
 */
typeSelect.onchange = function () {
  map.removeInteraction(draw);
  addInteraction();
};

document.getElementById('trash').addEventListener('click', function () {
  source.clear(); // Clear all drawn shapes
});




// BUTTON UPLOAD/////
// Find the upload GeoJSON button
const uploadBtn = document.getElementById("upload-geojson-btn");

// Add a click event listener to the button
uploadBtn.addEventListener("click", () => {
  // Allow the user to select a file
  const input = document.createElement("input");
  input.type = "file";

  // Handle the file selection
  input.onchange = (event) => {
    const file = event.target.files[0];

    // Check that the file is a GeoJSON file
    if (file.type === "application/json" || file.name.endsWith(".geojson")) {
      // Read the file contents as text
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;

        // Parse the GeoJSON and add it to the map
        const geojson = JSON.parse(text);
        L.geoJSON(geojson).addTo(map);
      };
      reader.readAsText(file);
    } else {
      alert("Please select a GeoJSON file.");
    }
  };

  // Click the input button to open the file selection dialog
  input.click();
});
