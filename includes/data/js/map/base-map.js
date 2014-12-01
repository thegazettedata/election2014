// Set view of Leaflet map based on screen size
var layer = new L.StamenTileLayer('toner-background');
var map = new L.Map('map', {
    center: new L.LatLng(42,-93.3),
    minZoom: 4,
    maxZoom: 10,
    zoom: 6,
    keyboard: false,
    boxZoom: false,
    doubleClickZoom: false,
    scrollWheelZoom: false,
    maxBounds: [[33.154799,-116.586914],[50.190089,-77.563477]]
});
map.addLayer(layer);

// Set mobile view of map
if ($(window).width() < 601) {
    map.setView([41.5,-93.5],6);
}


// GEOCODER
var maxY = 43.749935;
var minY = 40.217754;
var minX = -96.459961;
var maxX = -90.175781;

var searchMarker;
var searchIcon = L.AwesomeMarkers.icon({
    icon: 'circle',
    prefix: 'fa',
    markerColor: 'green'
});

$('#geocoder').geocodify({
    onSelect: function (result) {
        // Extract the location from the geocoder result
        var location = result.geometry.location;
        // Center the map on the result
        map.setView(new L.LatLng(location.lat(), location.lng()), 9);
        // Remove marker if one is already on map
        if (searchMarker) {
            map.removeLayer(searchMarker);
        }
        // Create marker
        searchMarker = L.marker([location.lat(), location.lng()], {
            clickable: false,
            icon: searchIcon
        });
        // Add marker to the map
        searchMarker.addTo(map);
    },
    initialText: 'Zip code, city, etc...',
    regionBias: 'US',
    // Lat, long information for Cedar Valley enter here
    viewportBias: new google.maps.LatLngBounds(
        new google.maps.LatLng(40.217754, -96.459961),
        new google.maps.LatLng(43.749935, -90.175781)
    ),
    width: 300,
    height: 26,
    fontSize: '14px',
    filterResults: function (results) {
        var filteredResults = [];
        $.each(results, function (i, val) {
            var location = val.geometry.location;
            if (location.lat() > minY && location.lat() < maxY) {
                if (location.lng() > minX && location.lng() < maxX) {
                    filteredResults.push(val);
                }
            }
        });
        return filteredResults;
    }
});

// // Find my location button
// $('#find_me').on('click', function () {
//     navigator.geolocation.getCurrentPosition(function (position) {
//         var lat = position.coords.latitude;
//         var lng = position.coords.longitude;
//         map.setView(new L.LatLng(lat, lng, 8));
//         // Remove marker if one is already on map
//         if (searchMarker) {
//             map.removeLayer(searchMarker);
//         }
//         // Create marker
//         searchMarker = L.marker([location.lat(), location.lng()], {
//             clickable: false,
//             icon: searchIcon
//         });
//         // Add marker to the map
//         searchMarker.addTo(map);
//     }, function (error) {
//         alert("Sorry! We couldn't find your address. Please try again.");
//     });
// });


// This sets our reset map view button
// This function darkens the button
function resetZoomToIA() {
    $('#zoom-to-iowa a').css({
        'background-color': '#fff',
        'color': '#333',
        'cursor': 'pointer'
    });
};

$(document).ready(function() {
    // Button is lightened whever button is clicked
    $('#zoom-to-iowa a').click(function() {
        // Fit to Iowa
        map.fitBounds([
            [40.375695169957574, -96.63948],
            [43.500841653675934, -90.14065605819877]
        ]);
        $(this).css({
            'background-color': '#f4f4f4',
            'color': '#bbb',
            'cursor': 'text'
        });
    });

    // Button is darkened whenever user moves map
    map.on('dragend', function(e) {
        resetZoomToIA();
    });

    map.on('zoomend', function(e) {
        if (map.getZoom() !== 6) {
            resetZoomToIA();
        }
    });
// Close document ready
});