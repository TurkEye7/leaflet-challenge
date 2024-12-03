// Constants for map configuration
const MAP_CONFIG = {
    center: [37.09, -95.71],
    zoom: 5,
    tileLayerUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    earthquakeDataUrl: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
  };
  
  // Color thresholds for earthquake depths
  const DEPTH_COLORS = [
    { threshold: 90, color: '#FF0000' },  // Deep red
    { threshold: 70, color: '#FF6600' },  // Orange
    { threshold: 50, color: '#FFCC00' },  // Yellow-Orange
    { threshold: 30, color: '#FFFF00' },  // Yellow
    { threshold: -Infinity, color: '#00FF00' }  // Green for shallow earthquakes
  ];
  
  // Initialize the map
  function initializeMap(elementId) {
    try {
      const map = L.map(elementId).setView(MAP_CONFIG.center, MAP_CONFIG.zoom);
      
      // Add tile layer
      L.tileLayer(MAP_CONFIG.tileLayerUrl, {
        attribution: MAP_CONFIG.attribution
      }).addTo(map);
      
      return map;
    } catch (error) {
      console.error("Error initializing map:", error);
      throw error;
    }
  }
  
  // Get color based on earthquake depth
  function getColor(depth) {
    for (let i = 0; i < DEPTH_COLORS.length; i++) {
      if (depth > DEPTH_COLORS[i].threshold) {
        return DEPTH_COLORS[i].color;
      }
    }
    return DEPTH_COLORS[DEPTH_COLORS.length - 1].color;
  }
  
  // Create circle marker for each earthquake
  function createMarker(feature, latlng) {
    const magnitude = feature.properties.mag;
    const depth = feature.geometry.coordinates[2];
    
    return L.circleMarker(latlng, {
      radius: Math.max(magnitude * 3, 5),  // Minimum size of 5
      fillColor: getColor(depth),
      color: "#000",
      weight: 0.5,
      opacity: 1,
      fillOpacity: 0.8
    });
  }
  
  // Create popup content for each earthquake
  function createPopupContent(feature) {
    const time = new Date(feature.properties.time).toLocaleString();
    return `
      <h3>${feature.properties.place}</h3>
      <hr>
      <p><strong>Magnitude:</strong> ${feature.properties.mag}</p>
      <p><strong>Depth:</strong> ${feature.geometry.coordinates[2]} km</p>
      <p><strong>Time:</strong> ${time}</p>
    `;
  }
  
  // Add earthquake data to the map
  function addEarthquakeData(map, earthquakeData) {
    if (!earthquakeData.features || !Array.isArray(earthquakeData.features)) {
      throw new Error('Invalid earthquake data format');
    }
  
    return L.geoJSON(earthquakeData, {
      pointToLayer: createMarker,
      onEachFeature: (feature, layer) => {
        layer.bindPopup(createPopupContent(feature));
      }
    }).addTo(map);
  }
  
  // Main function to initialize and load data
  async function initializeEarthquakeMap(elementId) {
    try {
      // Initialize map
      const map = initializeMap(elementId);
      
      // Fetch earthquake data
      const response = await fetch(MAP_CONFIG.earthquakeDataUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      addEarthquakeData(map, data.features);
      
      // Return map instance for further customization if needed
      return map;
    } catch (error) {
      console.error("Error setting up earthquake map:", error);
      throw error;
    }
  }
  
  // Usage:
  // document.addEventListener('DOMContentLoaded', () => {
  //   initializeEarthquakeMap('map')
  //     .catch(error => {
  //       console.error('Failed to initialize earthquake map:', error);
  //     });
  // });
  