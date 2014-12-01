// Global geojson
var geojson;

// Our default geojson fill color
var default_geojson_fill_color = "#EEE";

// Red, blues for map
var map_options = {
    // Our range of colors
    'colors': ["#c01c0f", "#f47d73","#4597dd","#154974"],
    // List of bucket names that matches up with our colors
    'color_buckets': ['GOP won', 'GOP leading', 'Dem leading', 'GOP won'],
    // Columns that we want to use in the popup
    'popup_columns_race': ['RACE_NAME1', 'RACE_NAME2', 'PRECINCTS_TOTAL', 'PRECINCTS_REPORTING'],
    'popup_columns_candidates': ['FIRST_NAME', 'LAST_NAME', 'PARTY_ABBR', 'VOTE_TOTAL_COMMIFIED', 'PCT_TOTAL']
}

// Available options for our map(s)
// This is where we set the spreadsheet key, text, colors, etc.
// And hash of the page
var map_data = {
    // Default selected toggle
    // Make sure this matches with the class name for the toggle in index.html
    'default': "mapussenate",
    // This matches our toggle option with the appropriate spreadsheet
    'options': [{
        // Button label
        'label': "mapussenate",
        // Name of variable that has our GeoJSON
        'geojson_variable_name': iowa_counties,
        // The value field within the geojson that will be used to pair with the data
        'geojson_property_name': 'Name',
        // The object we create when we initially loaded JSON data
        'json_object': 'ussenate'
    },{
        // Button label
        'label': "mapgovernor",
        // Name of variable that has our GeoJSON
        'geojson_variable_name': iowa_counties,
        // The value field within the geojson that will be used to pair with the data
        'geojson_property_name': 'Name',
        // The object we create when we initially loaded JSON data
        'json_object': 'governor'
    },{
        // Button label
        'label': "maphousedist1",
        // Name of variable that has our GeoJSON
        'geojson_variable_name': iowa_counties,
        // The value field within the geojson that will be used to pair with the data
        'geojson_property_name': 'Name',
         // The object we create when we initially loaded JSON data
        'json_object': 'housedist1'
    },{
        // Button label
        'label': "maphousedist2",
        // Name of variable that has our GeoJSON
        'geojson_variable_name': iowa_counties,
        // The value field within the geojson that will be used to pair with the data
        'geojson_property_name': 'Name',
         // The object we create when we initially loaded JSON data
        'json_object': 'housedist2'
    },{
        // Button label
        'label': "mapstatesenate",
        // Name of variable that has our GeoJSON
        'geojson_variable_name': state_senate,
        // The value field within the geojson that will be used to pair with the data
        'geojson_property_name': 'DISTRICT_N',
        // Name of the column that includes our
        // The object we create when we initially loaded JSON data
        'json_object': 'statesenate'
    },{
        // Button label
        'label': "mapstatehouse",
        // Name of variable that has our GeoJSON
        'geojson_variable_name': state_house,
        // The value field within the geojson that will be used to pair with the data
        'geojson_property_name': 'DISTRICT_N',
        // The object we create when we initially loaded JSON data
        'json_object': 'statehouse'
    }]
}

// GeoJSON mouse events
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight
    });
}

function highlightFeature(e) {
	var layer = e.target;
	layer.setStyle({
        weight: 3
	});

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
}

function resetHighlight(e) {
	var layer = e.target;
	layer.setStyle({
        weight: 1
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToBack();
    }
}

// The base styling for shapes on the map.
function base(feature) {
	return {
    	fillColor: default_geojson_fill_color,
        fillOpacity: 0.1,
    	weight: 1,
    	color: '#FFF',
        opacity: 1
    };
}

// Determines color of shapes
function assignColorPopup(popup_header, precincts_total, precincts_reporting, pct_precincts_reporting, candidates_info) {
    var candidate_lead = '';
    var candidate_lead_vote = 0;
    var candidate_lead_party = '';
    var candidate_lead_won = 'N';
    var winner_flagged = false;

    // Popup header
    var popup_content = '<h4>' + toTitleCase(popup_header);
    
    // Show word County on county races
    if ( Backbone.history.fragment.indexOf('mapstate') === -1) {
        popup_content += ' County';
    }
    popup_content += '</h4>';
    
    // Dont show races that aren't up for election
    if (precincts_total !== 'No election') {
        popup_content += '<span class="popup-precincts">';
    
        // Change nulls into zeros
        if (precincts_reporting === null || precincts_reporting === '' || precincts_reporting === ' ' ) {
            precincts_reporting = 0;
        }
    
        // Dont show races that aren't up
        if (precincts_total !== 'No election') {
            popup_content += precincts_reporting + ' / ' + precincts_total + ' precincts';
            popup_content += '</span>';
            popup_content += '<table class="popup_table table">';
            popup_content += '<thead><tr><td></td><td>Party</td><td>Incumbent</td><td>Votes</td></tr></thead>';
            popup_content += '<tbody>';
        }

        // Loop through candidates and find candidate with lead/win
        _.each(candidates_info, function (value_three, key_three) {
            // Convert nulls to zeros
            if (value_three['VOTE_TOTAL'] === null || value_three['VOTE_TOTAL'] === ' ' || value_three['VOTE_TOTAL'] === '') {
                value_three['VOTE_TOTAL'] = 0;
            }
                        
            // Determine who is the leader, winner
            if ( parseInt(value_three['VOTE_TOTAL'] ) > candidate_lead_vote )  {
                candidate_lead = value_three['LAST_NAME'];
                candidate_lead_vote = parseInt(value_three['VOTE_TOTAL'] );
                candidate_lead_party = value_three['PARTY_ABBR'];
                if ( value_three['PARTY_ABBR'] === 'Y') {
                    candidate_lead_won = 'Y';
                }
           }

           // Winner check
           if (value_three['WINNER'] === 'Z') {
            winner_flagged = true;
            candidate_lead_party = value_three['PARTY_ABBR'];
           }

            // Create popup content
            popup_content += '<tr>';
            
            // First name check
            if (value_three['FIRST_NAME'] !== null && value_three['FIRST_NAME'] !== ' ' !== value_three['FIRST_NAME'] !== '') {
                popup_content += '<td class="name">' + value_three['FIRST_NAME'] + ' ' + value_three['LAST_NAME'] + '</td>';
            } else {
                popup_content += '<td class="name">' + value_three['LAST_NAME'] + '</td>';
            }

            // Party check
            if (value_three['PARTY_ABBR'] !== null && value_three['PARTY_ABBR'] !== ' ' !== value_three['PARTY_ABBR'] !== '') {
                popup_content += '<td class="party">' + value_three['PARTY_ABBR'] + '</td>';
            } else {
                popup_content += '<td class="party"></td>';
            }

            // Incumbent check
            if (value_three['INCUMBENT'] !== null && value_three['INCUMBENT'] !== ' ' !== value_three['INCUMBENT'] !== '') {
                popup_content += '<td class="incumbent">' + value_three['INCUMBENT'] + '</td>';
            } else {
                popup_content += '<td class="incumbent"></td>';
            }

            popup_content += '<td class="votes">' + value_three['VOTE_TOTAL_COMMIFIED'] + '</td>';
            popup_content += '</tr>';
        }, this);

        // Close table
        popup_content += '</tbody></table>'

    // What to do with candidates that aren't up for re-election
    } else {
        var candidate_lead_party = candidates_info['CANDIDATE']['PARTY_ABBR'];
        var popup_content = "<h4>";
        popup_content += 'Senator: ';
        popup_content += candidates_info['CANDIDATE']['FIRST_NAME'] + ' ' + candidates_info['CANDIDATE']['LAST_NAME'] + ' (' + candidates_info['CANDIDATE']['PARTY_ABBR'] + ')';
        popup_content += "</h4>";
        popup_content += "<p style='clear: both;'>";
        popup_content += "This seat is not up for re-election this year.<br />It will be again in 2016.";
        popup_content += "</p>";
    }

    // Determine color of the shape
    if (candidate_lead_party === 'R' && pct_precincts_reporting === '100') {
        return ['#c01c0f', popup_content];
    } else if (candidate_lead_party === 'R' && winner_flagged === true) {
        return ['#c01c0f', popup_content];
    } else if (candidate_lead_party === 'R') {
        return ['#f47d73', popup_content];
    } else if (candidate_lead_party === 'D' && pct_precincts_reporting === '100') {
        return ['#154974', popup_content];
    } else if (candidate_lead_party === 'D' && winner_flagged === true) {
        return ['#154974', popup_content];
    } else if (candidate_lead_party === 'D') {
        return ['#4597dd', popup_content];
    } else {
        return ['#DDD', popup_content];
    }
// Close assign colors
}

function startUpLeafet() {
    var geojson_variable_name;
    var geojson_property_name;
    var json_object;

    if (Backbone.history.fragment.indexOf('demographics') > -1) {
        var hash_current = Backbone.history.fragment.replace('demographics', '');
    } else {
        var hash_current = Backbone.history.fragment;
    }
    
    // Look through all the map option objects
    // And figure out which GeoJSON file to use
    _.each(map_data['options'], function (value, key) {
        if (value['label'] === hash_current) {
            geojson_variable_name = value['geojson_variable_name'];
            geojson_property_name = value['geojson_property_name'];
            json_object = value['json_object'];
        }
    }, this);

    // Create geojson layer
    geojson = L.geoJson(geojson_variable_name, {
    	style: base,
    	onEachFeature: onEachFeature
    }).addTo(map);

    // Dissect the geojson layer
    // To color it
    // Loop through all the geojson layers
    _.each(geojson["_layers"], function (value, key) {
        // Current parcel = County, district
        var current_parcel = removeSpecialCharacters( value["feature"]["properties"][geojson_property_name].toLowerCase()  );

        // Loop through our JSON object
    	_.each(races_mappable[json_object], function (value_two, key_two) {
            var key_two_no_special = removeSpecialCharacters( key_two.toLowerCase() );
            // Match the value of current geojson parcel
    		// With the JSON file
    		// And assign a a color
    		if (key_two_no_special === current_parcel){

                if ( value_two['CANDIDATEINFO']['CANDIDATE'][0] === undefined) {
                    var candidates = value_two['CANDIDATEINFO'];
                } else {
                    var candidates = value_two['CANDIDATEINFO']['CANDIDATE'];
                }

                // Precincts info
                var precincts_total = value_two['RACEINFO']['PRECINCTS_TOTAL'];
                var precincts_reporting = value_two['RACEINFO']['PRECINCTS_REPORTING'];
                var pct_precincts_reporting = value_two['RACEINFO']['PCT_PRECINCTS_REPORTING'];

                // Load shape color, popup
                var color_popup_string = assignColorPopup(key_two, precincts_total, precincts_reporting, pct_precincts_reporting, candidates);

                // Fill the color of the current geojson layer
                value.setStyle({
        			fillColor: color_popup_string[0],
                    fillOpacity: 1
    			});

                // Bind popup
                value.bindPopup( color_popup_string[1] );

                // Send click event
                value.on('click', function() {
                    ga('send', 'event', 'Election 2014', 'Click a county, shape on the map');
                });

            // Close if statement
            } else {
                value.setStyle({
                    fillOpacity: 1
                });
            }
        }, this);
    }, this);

    // Show city labels
    city_labels.addTo(map);
    
    // Stop spinner once map is loaded
    spinner.stop();
};