// import necessary modules
import Map from 'ol/Map.js';
import MousePosition from 'ol/control/MousePosition.js';
import ScaleBar from 'ol/control/ScaleLine.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import {createStringXY} from 'ol/coordinate.js';
import {OverviewMap,defaults as defaultControls} from 'ol/control.js';
import XYZ from 'ol/source/XYZ.js';







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
  ],
  target: 'map',
  view: new View({
    center: [24, 55], 
    zoom: 7,
    projection: 'EPSG:4326', // set the projection for the view
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
