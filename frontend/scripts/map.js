var map = L.map('map', { crs: L.CRS.Simple, minZoom: -1.4, maxZoom: 2 });
var w = 2000, h = 1500;
var bounds = [[0, 0], [h, w]];

// Load floor plan
L.imageOverlay('', bounds).addTo(map);
map.fitBounds(bounds);

var drawnItems = new L.FeatureGroup().addTo(map);

// Draw controls
var drawControl = new L.Control.Draw({
    edit: { featureGroup: drawnItems, remove: true },
    draw: { polygon: false, polyline: false, rectangle: false, circlemarker: true, circle: true, marker: true }
});
map.addControl(drawControl);

// Add drawn shapes to feature group
map.on(L.Draw.Event.CREATED, function(e) {
    drawnItems.addLayer(e.layer);
});


document.getElementById('annotationForm').addEventListener('submit', function(e) {
    var data = [];
    var noteText = document.getElementById('notes').value; // grab notes

    drawnItems.eachLayer(function(layer) {
        if (layer instanceof L.Marker) {
            data.push({ type: 'marker', coords: layer.getLatLng(), notes: noteText }); // attach notes
        } else if (layer instanceof L.Circle) {
            data.push({ type: 'circle', center: layer.getLatLng(), radius: layer.getRadius(), notes: noteText }); // attach notes
        }
    });

    document.getElementById('annotationsInput').value = JSON.stringify(data);
});



// Add saved annotations to the map
savedAnnotations.forEach(a => {
    if (a.type === 'marker' && a.coords) {
        const marker = L.marker([a.coords.lat, a.coords.lng]);
        drawnItems.addLayer(marker);
    } else if (a.type === 'circle' && a.center && a.radius) {
        const circle = L.circle([a.center.lat, a.center.lng], { radius: a.radius });
        drawnItems.addLayer(circle);
    }
});
