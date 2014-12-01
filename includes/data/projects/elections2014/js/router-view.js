// Resets map when reader goes from Census map view
// To race view
function resetCensusMap() {
    // Reset values of sliders
    _.each( $('.ui-slider'), function (value, key) {
        var min_value = $(value).slider("option", "min");
        var max_value = $(value).slider("option", "max");
        $(value).slider("values", 0, min_value);$(value).slider("values", 1, max_value);
    }, this);

    // Make opacity on every shape on map
    for (var parcel in geojson["_layers"]) {
        geojson["_layers"][parcel].setStyle({
            fillOpacity: 1
        });
    }
};

// Sets race at the top of the page
// Based on hash
function setDisplayedRace() {
    // Change the displayed race
    _.each(races_displayed, function (value, key) {
        // Set displayed race
        var hash_race = Backbone.history.fragment.replace('map', '');
        var value_race_lower = removeSpecialCharacters( key.toLowerCase() );

        // Match hash with race object
        // And call function that gets our JSON data
        if (hash_race === value_race_lower) {
            raceDataBackbone(value, key, 'displayedRace');
        }
    }, this);
// Close change displayed race
};


// This removes map
// Then fires up map
function setMaps() {
    // Remove choropleth map if we have one
    if (geojson !== undefined) {
        map.removeLayer(geojson);
        map.removeLayer(city_labels);
    }

    // Load Leaflet
    startUpLeafet();
// Close set maps
}

// Hash navigation
var AppRouter = Backbone.Router.extend({
    routes: {
        "": "default",
        "*map": "map"
    },

    // If no hash
    default: function(id) {
        // Don't do on mobile
        if ($(window).width() > 650) {
            // Used with map-geojson
            map_data['global'] = removeSpecialCharacters(map_data['default']);

            // Set hash
            Backbone.history.navigate(map_data['global'], true);
        }
    },

    // Show data on map
    // Only called on desktop
    map: function(id) {
        // Don't do on mobile
        if ($(window).width() > 650) {

            // Hide county demographics tab on statewide races
            if ( Backbone.history.fragment.indexOf('mapstate') > -1) {
                $('#county-breakdown-header').hide();
            } else {
                $('#county-breakdown-header').show();
            }
            
            // Don't do on mobile
            if ($(window).width() > 650) {
                // Set the displayed race
                setDisplayedRace();
            }

            // Set maps
            setMaps();
        }
    }
});


var slider_shown = false;

// View for our raceboxes
var AppView = Backbone.View.extend({
    el: 'body',

    events: {
        "click #more-races-text a": 'clickMoreRaces',
        "click #raceSelect #raceBoxes-container .raceBox": "clickRacebox",
        "click #county-breakdown-header a": "sliderShow",
        "change .dropdown": "sliderDropdownChange",
        "click #searchable-table tbody tr td a": "searchRaceTable"
    },

    // More Races header
    clickMoreRaces: function(ev) {
        ga('send', 'event', 'Election 2014', 'Click Top race results');
        ev.preventDefault();

        $('#county-breakdown').hide();
        $('.show-county-breakdown-text').hide();
        $('#raceBoxes-container').show();
        $('.show-race-text').show();
        $('.show-race-header').show();
        $('#more-races-text').siblings().removeClass('active');
        $('#more-races-text').addClass('active');

        // Reset sliders, map
        resetCensusMap();
    },

    // Click race box
    clickRacebox: function(ev) {
        ga('send', 'event', 'Election 2014', 'Click racebox on left side');

        Backbone.history.navigate('map' + $(ev.currentTarget).attr('id'), true);

        // Change content on page
        if ( $(window).width() > 800 ) {
            $(ev.currentTarget).addClass('selected');
            $(ev.currentTarget).hide();

            // Fade in hidden siblings
            $(ev.currentTarget).siblings('.selected').fadeIn().removeClass('selected');
        // If on mobile we'll scroll down to map
        } else if ( $(window).width() > 651 ) {
            $("html, body").animate({
                scrollTop: $('#map-container').offset().top - 85
            }, 500);
        }

        return this;
    },

    // Show sliders that toggle Census data
    sliderShow: function(ev) {
        ga('send', 'event', 'Election 2014', 'Click county demographics');
        ev.preventDefault();

        $('#raceBoxes-container').hide();
        $('.show-race-header').hide();
        $('.show-race-text').hide();
        $('#county-breakdown-header').siblings().removeClass('active');
        $('#county-breakdown').show();
        $('.show-county-breakdown-text').show();
        $('#county-breakdown-header').addClass('active');

        // Only show slider once
        if( !slider_shown ) {
            slider_shown = true;
            // Initialize our sliders
            intializeSliders();
        }
    },

    // One of the option boxes that corresponds with a slider is changed
    sliderDropdownChange: function(ev) {
        ga('send', 'event', 'Election 2014', 'County demographics dropdown change');

        var slider_div = $(ev.currentTarget).val()
        
        // Show the right slider and hide the others
        $('.'  + slider_div).show();
        $('.'  + slider_div).siblings().hide();

        // Reset slider
        var min_slider = $( "#slider-" + slider_div ).slider("option", "min");
        var max_slider = $( "#slider-" + slider_div ).slider("option", "max");
        $( "#slider-" + slider_div ).slider("values", 0, min_slider);
        $( "#slider-" + slider_div ).slider("values", 1, max_slider);

        // Reset values in selected categories object
        _.each( $('#dropdown-' + slider_div).siblings(), function (value, key) {
            var value = $(value).val();
            var min_value = $("#slider-" + value).slider("option", "min");
            var max_value = $("#slider-" + value).slider("option", "max");

            selected_categories[value] = [min_value, max_value];
        }, this);

        // Call slider
        $( "#slider-" + slider_div ).slider('option', 'change').call( $( "#slider-" + slider_div ) );
    },

    // Click race name in table
    searchRaceTable: function(ev) {
        ga('send', 'event', 'Election 2014', 'Search contested races table');

        ev.preventDefault();

        if ( $(window).width() < 651 ) {
            // Scroll to the table
            $("html, body").animate({
                scrollTop: $('#localRaces').offset().top - 85
            }, 500);
        }

        var race_name = $(ev.currentTarget).text();
        // Put value in search field
        $('.dataTables_filter input').val(race_name)
        // Search table and draw
        localraces_datatable.search(race_name).draw();
    }
});


// Create instance of router
var approuter = new AppRouter();
var appview = new AppView();