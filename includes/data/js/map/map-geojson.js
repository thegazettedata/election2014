// GLOBAL VARIABLES
// Set the geojson variable to whatever geojson file you want to use on the map. (geojson file must have names
// for the shapes that correspond with columns in the data set for matching.)
var geojson_variable_name = iowa_counties;

// This is where you define the value field within the geojson that will be used to pair with the data.
var geojson_property_name = 'Name';
// Global Tabletop data used for map change
var g_tabletop_data;
// Global geojson
var geojson;

// URL beginning and end, which will be used with the key
// To give Tabletop a URL
var google_docs_one = 'https://docs.google.com/spreadsheet/pub?hl=en_US&hl=en_US&key=';
var google_docs_two = '&output=html';

// Our default geojson fill color
var default_geojson_fill_color = "#A50F15";

// Available options for our map(s)
// This is where we set the spreadsheet key, text, colors, etc.
// And hash of the page
var map_data = {
    // Global that will be filled. It helps us toggle map
    // Leave this blank
    'global': '',
    // Default selected toggle
    // Make sure this matches with the class name for the toggle in index.html
    'default': "Intro",
    // This matches our toggle option with the appropriate spreadsheet
    'options': [{
        // Button label
        'label': "Intro",
        // Google Docs spreadsheet key
        // If none, enter empty string
        'spreadsheet_key': '1QHCvnRsx7JVteQ2G4FhHl_90mN93x4BwBqQ7iI0Ck20',
        // Name of the column that includes our shape names
        'shape_column': 'county',
        // Our range of colors
        'colors': ["#edcfd0","#db9fa1","#c96f72","#b73e43","#A50F15"],
        // List of bucket names that matches up with our colors
        // It can equal a column name in your spreadsheet
        // Or if you using one column and shading it light to dark 
        // Include the numbers that you want to split the buckets into
        // Example: [100, 200, 300, 400, 500] would split map into five buckets of 100 each
        'color_buckets': [90400, 180700, 271000, 361300, 452000],
        // Label to appear with buckets
        'color_buckets_label': 'Buckets',
        // The column in the SS that sets the color
        'colors_column': 'population',
        // Columns that we want to use in the popup
        'popup_columns': ['population'],
        // Information about this map for the sidebar
        'sidebar_text': {
            // Can be deleted if not used
            'sidebar_text_header': 'Header text goes here',
            // This will replace the 'Please wait while the map loads...' text
            'sidebar_text_intro': "Intro text goes here",
            // Can be deleted if not used
            'sidebar_text_about': 'About text goes here',
            // Can be deleted if not used
            'sidebar_text_extra': '*Extra text goes here'
        }
    },{
        // Button label
        'label': "Map two",
        // Google Docs spreadsheet URL
        // If none, enter empty string
        'spreadsheet_key': '19MCFiYnM_9Wag0bwkiEf1JMNVO0sFpTHCLFZdlnqsAA',
        // Name of the column that includes our shape names
        'shape_column': 'county',
        // Our range of colors
        'colors': ["#A50F15","#c96f72","#6a8fbe","#084594"],
        // List of bucket names that matches up with our colors
        // It can equal a column name in your spreadsheet
        // Or if you using one column and shading it light to dark 
        // Include the numbers that you want to split the buckets into
        // Example: 100, 200, 300, 400, 500 would split map into five buckets of 100 each
        'color_buckets': ['Strong Republican', 'Leans Republican', 'Leans Democrat', 'Strong Democrat'],
        // Label to appear with buckets
        'color_buckets_label': 'Buckets',
        // The column in the SS that sets the color
        'colors_column': 'lean',
        // Columns that we want to use in the popup
        'popup_columns': ['democrats', 'republicans', 'noparty', 'lean'],
        // Information about this map for the sidebar
        'sidebar_text': {
            // Can be deleted if not used
            'sidebar_text_header': 'Header text goes here',
            // This will replace the 'Please wait while the map loads...' text
            'sidebar_text_intro': "Intro text goes here",
            // Can be deleted if not used
            'sidebar_text_about': 'About text goes here',
            // Can be deleted if not used
            'sidebar_text_extra': '*Extra text goes here'
        }
    }]
}

// This is set to the length of 'options' in map_data
// It's set on initial load
var map_data_length = 0;

// This function sets the header for our popups
// Variable is value of the first row
function popupHeader(row_header) {
    // This catches our counties that aren't formatted correctly
    // And makes them so
    if (row_header === 'blackhawk') {
        row_header = 'black hawk'
    } else if (row_header === 'buenavista') {
        row_header = 'buena vista'
    } else if (row_header === 'cerrogordo') {
        row_header = 'cerro gordo'
    } else if (row_header === 'desmoines') {
        row_header = 'des moines'
    } else if (row_header === 'obrien') {
        row_header = "o'brien"
    } else if (row_header === 'paloalto') {
        row_header = "palo alto"
    }

    // What is shown in popup
    return "<h4>" + toTitleCase(row_header) + " County</h4>"
}

// This sets the content of the popups
// First variable is map number we're one
// Second variable is an array of content we want to display in 
function popupContent(map_number, popup_columns) {
    try {
        var myTracker=_gat._getTrackerByName();
        myTracker._trackEvent("Event tracking goes here" , "County popup");
    }catch(err){}

    // This determines which map the geojson layer is apart of
    // And formats it accordingly
    var popup_content = '<table class="popup_table table">';

    // Loop through the array with our popup info
    // And create a variable we will return
    for (var num = 0; num < popup_columns.length; num ++) {
        // Column name
        var name = popup_columns[num][0];
        // Value of column
        var value = popup_columns[num][1];

        // Make these words two in second map
        if (map_number === 1) {
            if (name === 'noparty') {
                name = 'no party';
            } else if (name === 'inactive') {
                name = 'in active';
            }
        }

        // Create popup content
        popup_content += '<tr>';
        popup_content += '<td><strong>' + capitaliseFirstLetter(name) + ':</strong></td>';
        popup_content += '<td>' + commaSeparateNumber(value) + ' votes</td>';
        popup_content += '</tr>'
    }
    popup_content += '</table>'
    return popup_content;
}


// This sets HTML of sidebar
function sidebarContent(number_of_colors, data_one, data_two) {
    var width = 100 / number_of_colors - 1;
    sidebar_string = '<td class="color-box" style="width:';
    sidebar_string += width;
    sidebar_string += '%"><span style="background-color:' + data_one + ';"' + '></span>' + data_two + '</td>';
    return sidebar_string;
};

// This builds our sidebar with our data
// And adds to the DOM
// It uses sideBarcontent to set the HTML
function buildSidebar(data){
    // We'll put sidebar content from our spreadsheet here
    // Run a loop
    // Then append to the DOM
    if (data['color_buckets'] !== '' && data['color_buckets'] !== undefined) {
        var sidebar_content_colors = '<strong>' + data['color_buckets_label'] + '</strong>';
        sidebar_content_colors += '<table class="colors"><tr>';

        // Creates legend with our colors
        for (var x = 0; x < data['colors'].length; x++){
            // Capture values
            var c_color = data['colors'][x];
            var c_bucket = data['color_buckets'][x];

            // Call function above with appropriate content
            // To style sidebar
            if (typeof color_buckets[0] === 'string') {
                sidebar_content_colors += sidebarContent(data['colors'].length, c_color, c_bucket);
            } else if (typeof color_buckets[0] === 'number') {
                // Capture previous values to make ranges on map
                var c_bucket = parseInt(data['color_buckets'][x]);
                var c_bucket_commas = commaSeparateNumber(c_bucket);
                sidebar_content_colors += sidebarContent(data['colors'].length, c_color, c_bucket_commas);
            }
        }
        sidebar_content_colors += '</tr></table>';

        // Append to DOM
        $(".sidebar_content_colors").html('<p>' + sidebar_content_colors + '</p>');
    } else {
        sidebar_content_colors = '';
    }

    // Append sidebar content to DOM
    sidebar_text_keys = _.keys(data['sidebar_text']);
    
    // Loop through our sidebar_text object
    // And append key, value to matching DIVs
    for (var x = 0; x < sidebar_text_keys.length; x++) {
        // Capture key, value of sidebar_text object
        var key = sidebar_text_keys[x];
        var text = data['sidebar_text'][sidebar_text_keys[x] + ''];

        // If text within our object, append to DOM
        if (text !== '' && text !== undefined) {
            // Append to the DOM
            $("." + key).html('<p>' + text + '</p>');

            // If it's the header, we're putting content in two spots
            if (key === 'sidebar_text_header') {
                $('.header-sub-header').html('<p>' + text + '</p>');
            }
        }
    }
}


// GeoJSON mouse events
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight
    });

    // Default popup that will be overwritten
    // layer.bindPopup(popupHeader(feature.properties.Name));
}

function highlightFeature(e) {
	var layer = e.target;
	layer.setStyle({
        weight: 3
	});

    // if (!L.Browser.ie && !L.Browser.opera) {
    //     layer.bringToFront();
    // }
}

function resetHighlight(e) {
	var layer = e.target;
	layer.setStyle({
        weight: 1
    });

    // if (!L.Browser.ie && !L.Browser.opera) {
    //     layer.bringToBack();
    // }
}

// The base styling for shapes on the map.
function base(feature) {
	return {
    	fillColor: default_geojson_fill_color,
        fillOpacity: 0.7,
    	weight: 1,
    	color: '#333',
        opacity: 0.2
    };
}


// This function gets our data from our spreadsheet
// Then gets it ready for Leaflet.
// It creates the marker, sets location
// And plots it on our map
function captureData(initial_tabletop_data) {
	g_tabletop_data = initial_tabletop_data;
	startUpLeafet(g_tabletop_data);
};

// Pull data from Google spreadsheet via Tabletop
function initializeTabletopObject(data_spreadsheet){
	// Uncomment this after your Google spreadsheet data
    // Is exported to JSON
    // Then replace 'offenders' with the name of variable in the JSON file
    // captureData(offenders);

    Tabletop.init({
    	key: data_spreadsheet,
    	callback: captureData,
    	simpleSheet: true,
    	debug: false
    });
}


// Decide what color to assign to the shapes
// We will also push content to our data
// To use later
function assignColor(data){
    // Used to set hash of buttons
    var label_no_special_next;
    var label_no_special_prev;

    // Look through all the map option objects
	for (var y = 0; y < map_data_length; y++) {
        // Only proceed if we have the right map option object
        // With the right map options
        // We'll check to see which map we're on using the global variable
        // Which is set through hash
        label_no_special = removeSpecialCharacters(map_data['options'][y]['label']);;
        if (label_no_special === map_data['global']) {
            // Capture values in map_data variable
            shape_column = map_data['options'][y]['shape_column'];
            colors = map_data['options'][y]['colors'];
            color_buckets = map_data['options'][y]['color_buckets'];
            color_buckets_label = map_data['options'][y]['color_buckets_label'];
            colors_column = map_data['options'][y]['colors_column'];
            colors_type = map_data['options'][y]['colors_type'];
            popup_columns = map_data['options'][y]['popup_columns'];
            sidebar_text = map_data['options'][y]['sidebar_text'];

            if (data !== '' && data !== undefined) {
                // Loop through our tabletop data array
                for(var x = 0; x < data.length; x++){
                    // Capture the map number
                    // For later use
                    data[x]['map_number'] = y;
                    // Capture the name of the columns we want to use in popup
                    // For later use
                    data[x]['popup_columns'] = popup_columns;

                    // Go through JSON data above and assign color to this particular array item
                    for (var v = 0; v < color_buckets.length; v++){
                        // If we are dealing with strings
                        // We know we need to match column names to get colors
                        if (typeof color_buckets[0] === 'string') {
                            // This determines what type of color bucket we're dealing with
                            // The first matches column names in the spreadsheet with appropriate colors
                            if (data[x][colors_column] === color_buckets[v]) {
                                // Assign color to array
                                data[x]['map_color'] = colors[v];
                                // Capture the name of the columns we want to use in popup
                                // For later use
                                data[x]['popup_columns'] = popup_columns;
                            }
                        // Otherwise we are shading the map sequentially based on numerical values
                        // In one column in the spreadsheet
                        } else if (typeof color_buckets[0] === 'number') {
                            var c_colors_column = parseInt(data[x][colors_column]);

                            // Set color of shapes under lowest amount
                            if (c_colors_column <= color_buckets[0]) {
                                data[x]['map_color'] = colors[v];
                                break;
                            } else if (c_colors_column >= color_buckets[v] && c_colors_column <= color_buckets[v + 1]) {
                                data[x]['map_color'] = colors[v + 1];
                                break;
                            }
                        }
                    }
                }
            } else {
                data = [];
                data['popup_columns'] = popup_columns;
            }
            // Capture the name of the column with the shape name
            // For later use
            data['shape_column'] = shape_column;
            data['colors'] = colors;
            data['color_buckets'] = color_buckets;
            data['color_buckets_label'] = color_buckets_label;
            data['sidebar_text'] = sidebar_text;

            // If there is more than one spreadsheet,
            // We'll set hash of button that is used to switch maps
            if (map_data_length > 1) {
                // Show buttons
                $('.toggle_container').show();

                // This captures the values of the labels of prev, next options
                if (map_data['options'][y + 1] !== undefined) {
                    $('.toggle-next').show();
                    label_no_special_next = removeSpecialCharacters(map_data['options'][y + 1]['label']);
                }

                if (map_data['options'][y - 1] !== undefined) {
                    $('.toggle-prev').show();
                    label_no_special_prev = removeSpecialCharacters(map_data['options'][y - 1]['label']);
                }

                // This sets href of both prev, next buttons
                if (label_no_special_next !== undefined) {
                    $('.toggle-next a').attr('href', '#' + label_no_special_next);
                } else {
                    $('.toggle-next').hide();
                }

                if (label_no_special_prev !== undefined) {
                    $('.toggle-prev a').attr('href', '#' + label_no_special_prev);
                } else {
                    $('.toggle-prev').hide();
                }
            // Close if statement for buttons
            }
        // Close if statement
        }
    // Close for loop
	} 

	return data;
}

function startUpLeafet(tabletop_data) {
    // This commented out console.log captures the Tabletop data into JSON form
    // For when you want to export the data
    // And not have the project run off a Google spreadsheet
    // Uncomment this, then copy what spits out in the console
    // And create a new file for it
    // Make sure you wrap the JSON data in a variable
    // console.log(JSON.stringify(tabletop_data, null, 4))

    // Create geojson layer
	geojson = L.geoJson(geojson_variable_name, {
		style: base,
		onEachFeature: onEachFeature
    }).addTo(map);

    if (tabletop_data !== '' && tabletop_data !== undefined) {
        // Assign a  color to the tabletop data
       tabletop_data = assignColor(tabletop_data);
       this_shape_column = tabletop_data['shape_column'];

       // Dissect the geojson layer
        // To color it
        // Loop through all the geojson layers
        for (var parcel in geojson["_layers"]) {
            var current_parcel = geojson["_layers"][parcel]["feature"]["properties"][geojson_property_name];
        	// Loop through all the columns in our Google SS
        	for(var x = 0; x < tabletop_data.length; x++){
                // Match the value of current geojson parcel
        		// With the Google SS column with the same name
        		// And assign a a color
        		if (tabletop_data[x][this_shape_column] === current_parcel){
                    // Capture current values
        			var c_map_number = tabletop_data[x]['map_number'];
        			var c_shape_column = tabletop_data[x][this_shape_column];
        			var c_popup_columns = tabletop_data[x]['popup_columns'];
        			// Empty array we will push popup content to 
        			var c_popup_columns_data = [];

        			// This creates an array of name, value pairs
        			// Of the data we want to use in popup
        			for (var num = 0; num < c_popup_columns.length; num ++) {
        				// Add empty array, which we will push to in this iteration
        				c_popup_columns_data.push([]);
        				// Push name of the column
        				c_popup_columns_data[num].push(c_popup_columns[num]);
        				// Push value in that column
        				c_popup_columns_data[num].push(tabletop_data[x][c_popup_columns[num]]);
        			}

        			// This formats our popup content
        			// Sends to function above
        			var string = popupContent(c_map_number, c_popup_columns_data);

        			// Bind a popup with popup header, content
        			geojson["_layers"][parcel].bindPopup(popupHeader(c_shape_column) + string);
        			

                    var shape_color = tabletop_data[x]['map_color'];

                    // Fill the color of the current geojson layer
                    geojson["_layers"][parcel].setStyle({
        				fillColor: shape_color,
        				fillOpacity: 1,
        				opacity: 1
    				});
        		}
        	}
        }

        // Build sidebar
        buildSidebar(tabletop_data);
    } else {
        // Assign a color to the tabletop data
        tabletop_data = assignColor();

        geojson.setStyle({
            fillColor: tabletop_data['colors'][0],
            fillOpacity: 1,
            opacity: 1
        });

        for (var num = 0; num < tabletop_data['popup_columns'].length; num ++) {}
        // Build sidebar
        buildSidebar(tabletop_data);
    }

    // Add markers to map if function exists
    // The function is in the map-marker.js file
    // If you choose to include it
    if(typeof loadMarkersToMap === 'function') {
        // If we haven't loaded the Tabletop data in the map-marker.js
        // We'll do that
        if (global_markers_data === undefined) {
            initializeTabletopObjectMarkers();
        // Otherwise we'll bring the markers we loaded in map-marker.js to the front
        } else {
            loadMarkersToMap(global_markers_data);
        }
    }

    // Fit the map around the geojson layer
    map.fitBounds( geojson.getBounds() );
};


// This is called when one of the toggle one buttons are clicked
// Also called when map is first loaded
function initialLoad() {
    // Loop through map_data options from above
    for(var x = 0; x < map_data_length; x++){
		// Capture values
        var label_no_special = removeSpecialCharacters(map_data['options'][x]['label']);
        var spreadsheet_key = map_data['options'][x]['spreadsheet_key'];

        // Here's the Tabletop feeds
		// Call the appropriate Tabletop feed
		// Depending on which option the user selected
		if (map_data['global'] === label_no_special && spreadsheet_key !== '') {
            initializeTabletopObject(google_docs_one + spreadsheet_key + google_docs_two);
		}

        // If no spreadsheet_key is specified
        // We'll skip the initialize Tabletop function
        if (spreadsheet_key === '') {
            startUpLeafet();
        }
	}
};


// DOCUMENT READY
// This toggles hash based on what is clicked
// Then sets map
$(document).ready(function() {
	// Add appropriate buttons to DOM
    // addToggleButtonsToDOM();

    // Set global variable of map data length
    // To use later
    map_data_length = map_data['options'].length;

    // Show toggle buttons, add click event if we have more than one spreadsheet
    if (map_data_length > 1) {

        // Add click event
        $('body').on('click', '.toggles a', function(e) {
            try {
                var myTracker=_gat._getTrackerByName();
                myTracker._trackEvent("Event tracking goes here" , "Next, prev button click");
            }catch(err){}

            // Prevent hash from being created with a href link
            e.preventDefault();
            // Remove space and dot from text that's on the button
            // And make it a global variable
            // To use with hash

            map_data['global'] = removeSpecialCharacters($(this).attr('href'));
            // Set hash
            // window.location.hash = map_data['global'] + "/" + toggle_two['global'];
            window.location.hash = map_data['global'];

            // First remove geojson layer so we don't have several on map
            geojson.clearLayers();
            // Set which spreadsheet will show on map
            initialLoad();

            // Set which buttons are pressed down
            // setButtonPressDown();

            // Scroll to the top of the page
            // Used for mobile
            $('html,body').animate({ scrollTop: 0 }, 800); 
        });
    }

    // Find current hash and set map_data['global'], toggle_two['global'] to make map run
    if (window.location.hash !== "") {
        map_data['global'] = removeSpecialCharacters(window.location.hash);
	} else {
    	map_data['global'] = removeSpecialCharacters(map_data['default']);
        window.location.hash = map_data['global'];
    }

	// Set which spreadsheet will show on map
	initialLoad();

	// Set which buttons are pressed down
	// setButtonPressDown();
});