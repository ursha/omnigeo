import Map from 'ol/Map.js';
import MousePosition from 'ol/control/MousePosition.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import {createStringXY} from 'ol/coordinate.js';
import {defaults as defaultControls} from 'ol/control.js';
import XYZ from 'ol/source/XYZ.js';

const mousePositionControl = new MousePosition({
  coordinateFormat: createStringXY(4),
  projection: 'EPSG:4326',
  // comment the following two lines to have the mouse position
  // be placed within the map.
  className: 'custom-mouse-position',
  target: document.getElementById('mouse-position'),
});

const map = new Map({
  controls: defaultControls().extend([mousePositionControl]),
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: 'map',
  view: new View({
    center: [2638930, 7473825], // Lithuania coordinates in EPSG:3857 projection
    zoom: 7,
    projection: 'EPSG:3857', // set the projection for the view
  }),
});

const projectionSelect = document.getElementById('projection');
projectionSelect.addEventListener('change', function (event) {
  mousePositionControl.setProjection(event.target.value);
});

const precisionInput = document.getElementById('precision');
precisionInput.addEventListener('change', function (event) {
  const format = createStringXY(event.target.valueAsNumber);
  mousePositionControl.setCoordinateFormat(format);
});

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

