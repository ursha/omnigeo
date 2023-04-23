import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import {fromLonLat} from 'ol/proj';

const osmLayer = new TileLayer({
  source: new OSM()
});

const satelliteLayer = new TileLayer({
  source: new XYZ({
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    attributions: 'Map data ©2022 Google'
  })
});

const map = new Map({
  target: 'map',
  layers: [osmLayer],
  view: new View({
    center: fromLonLat([24.6, 55.7]),
    zoom: 7
  })
});

document.getElementById('basemap-select').addEventListener('change', event => {
  const value = event.target.value;
  if (value === 'osm') {
    map.removeLayer(satelliteLayer);
    map.addLayer(osmLayer);
  } else if (value === 'satellite') {
    map.removeLayer(osmLayer);
    map.addLayer(satelliteLayer);
  }
});
