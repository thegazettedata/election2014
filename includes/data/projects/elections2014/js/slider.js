var selected_categories = {};

// Called every time the slider is changed
function changeMapOnSlide(category, wording_before, wording_after) {
    var min_slider_val = $("#slider-" + category).slider('values', 0);
    var min_slider_val_comma = commaSeparateNumber(min_slider_val);
    var max_slider_val = $("#slider-" + category).slider('values', 1);
    var max_slider_val_comma = commaSeparateNumber(max_slider_val);

    // Add to object so we can filter more than one category at a time
    selected_categories[category] = [min_slider_val, max_slider_val];

    $(".current-" + category).html( wording_before + min_slider_val_comma + ' to ' +  max_slider_val_comma  + wording_after );

    // Loop through layers in GeoJSON on map and figure out if it matches with slider
    for (var parcel in geojson["_layers"]) {
        // Current value of property set by slider
        var current_parcel = geojson["_layers"][parcel]["feature"]["properties"][category];
        var current_properties = geojson["_layers"][parcel]["feature"]["properties"];

        // Match up with what's in the slider and in the county
        if (current_parcel >= min_slider_val && current_parcel <= max_slider_val) {
            // Show county if we have just one selected category
            // And it matches what's in the slider
            if (Object.keys(selected_categories).length === 1) {
                // Show the counties that apply
                geojson["_layers"][parcel].setStyle({
                    fillOpacity: 1
                });
            } else {
                var county_show = true;

                // Check other selected categories and hide those that don't apply
                _.each(selected_categories, function (value, key) {
                    // Hide counties that don't match up with other attributes selected
                    if (current_properties[key] < value[0] || current_properties[key] > value[1]) {
                        geojson["_layers"][parcel].setStyle({
                            fillOpacity: 0.1
                        });
                        county_show = false;
                    }
                }, this);
                
                // Show the counties that apply
                if ( county_show === true) {
                    geojson["_layers"][parcel].setStyle({
                        fillOpacity: 1
                    });
                }
            }
        } else {
            // Set style of GeoJSON on map
            geojson["_layers"][parcel].setStyle({
                fillOpacity: 0.1
            });
        }
    }
// Close slider function
}

// Creates the slider itself by calling jQuery UI
function createSliders(value) {
    // Call slider
    $( "#slider-" + value[0] ).slider({
        range: true,
        min: value[4],
        max: value[5],
        values: [ value[4], value[5] ],
        slide: function( event, ui ) {
           ga('send', 'event', 'Election 2014', 'Slider slide');

           // Change data show on map
           changeMapOnSlide(value[0], value[2], value[3] );
        },
        change: function( event, ui ) {
            ga('send', 'event', 'Election 2014', 'Slider change');
            
            // Change data show on map
            changeMapOnSlide(value[0], value[2], value[3] )
        }
    // Close slider function
    });
// Close create slider
}

// This starts up the slider creation process
function intializeSliders() {
    // Info for each category
    // Name, extra text, value/min, max, step, and further toggle
    var slider_categories = [
        ['population', 'Population', '', '', 4000, 432000, 30784, 3047646, 'na'],
        [
            ['white_percent', 'White', '', '%',  82, 99, '', 91.7, 'race'],
            ['black_percent', 'Black', '', '%',  0, 9, '', 2.9, 'race'],
            ['indian_percent', 'American Indian / Alaska native', '', '%',  0, 8, '', 0.3, 'race'],
            ['asian_percent', 'Asian', '', '%',  0, 8, '', 1.8, 'race'],
            ['other_percent', 'Other: One race', '', '%',  0, 8, '', 1.5, 'race'],
            ['tworaces_percent', 'Two or more races', '', '%',  0, 5, '', 1.8, 'race'] 
        ],
        ['median_age', 'Median age', '', '',  26, 49, '', 38, 'na'],
        [

            ['12th_under_percent', '12th grade (no diploma) & under', '', '%',  4, 23, '', 9.3, 'education'],
            ['high_school_ged_some_college_percent', 'High school, GED & no college', '', '%',  35, 70, '', 55, 'education'],
            ['college_percent', 'College', '', '%',  18, 60, '', 35.6, 'education']
        ],
        [
            ['education_health_care_social_assistance_percent', 'Education, health care & social assistance', '', '%',  17, 41, '', 23.8, 'industry of work'],
            ['manufacturing_percent', 'Manufacturing', '', '%',  5, 33, '', 14.7, 'industry of work'],
            ['finance_real_estate_rental_percent', 'Finance, real estate & Rental', '', '%',  2, 23, '', 7.7, 'industry of work'],
            ['agriculture_percent', 'Agriculture', '', '%',  1, 17, '', 4, 'industry of work'],
            ['retail_percent', 'Retail', '', '%',  7, 19, '', 11.7, 'industry of work'],
            ['construction_percent', 'Construction', '', '%',  3, 12, '', 6.1, 'industry of work'],
            ['arts_entertainment_recreation_food_services_percent', 'Arts, entertainment, recreation & food services', '', '%',  2, 12, '', 7.6, 'industry of work']
        ],
        ['median_household_income', 'Median household income', '$', '',  34000, 72000, '', 52229, 'na']
    ];
    
    // Loop through each category above and create a slider for each
     _.each(slider_categories, function (value, key) {
        // Called if we have an array of values we want to group together
        if (typeof value[0] !== 'string') {
            var value_array = value;

            // Create new DIV and append to DOM
            var category_no_special = removeSpecialCharacters(value[0][8]);
            
            if (value[0][8] === 'education') {
                var category_uppercase = 'Min. level of education'
            } else {
                var category_uppercase = capitaliseFirstLetter(value[0][8]);
            }

            $('.slider-details-box').append('<div class="slider-category ' + category_no_special + '"><span class="slider-category-header">' + category_uppercase + '</span>: <select class="dropdown"></select>');
            $('.' + category_no_special ).append('<span class="dropdown-options-' + category_no_special + '">');

            // Loop through our array of an array
            _.each(value_array, function (value, key) {
                var category_no_special = removeSpecialCharacters(value[8]);

                // HTML for option
                var slider_option_html = '<option id="dropdown-' + value[0] + '" value="' + value[0] + '">' + value[1] + '</option>';
                
                // HTML for slider
                var slider_dropdown_html = '<span class="' + value[0] + '">';
                slider_dropdown_html += '<span class="slider-category-current current-' + value[0] + '">' + value[2] + commaSeparateNumber(value[4]) + ' to ' + value[2] + commaSeparateNumber(value[5]) + value[3] + '</span>';
                slider_dropdown_html += '<div id="slider-' +  value[0] + '"></div>';
                slider_dropdown_html += '<span class="average">';
                if (value[6] !== '') {
                    slider_dropdown_html += 'County average: ' + value[2] +  commaSeparateNumber(value[6]) +  value[3] + ' / '
                }
                slider_dropdown_html += 'Entire state: ' + value[2] +  commaSeparateNumber(value[7]) +  value[3] + '</span>';
                slider_dropdown_html += '</span>';

                // Append slider element to select
                $('.' + category_no_special + ' select').append(slider_option_html);
                // Append to newly created DIV
                $('.dropdown-options-' + category_no_special ).append(slider_dropdown_html);
                
                // Create slider 
                createSliders(value);

                // Show only the slider for the first option
                if (key !== 0) { 
                    $('.' + value[0]).hide();
                }
            }, this);

            // Close DIV
            $('.slider-details-box').append('</span></div>');
        
        // Called if we have just one
        } else {
            // Create new DIV and append to DOM
            $('.slider-details-box').append('<div class="slider-category ' + value[0] + '">');

            // HTML
            var slider_html = '<span class="slider-category-header ' + value[0] + '">' + value[1];
            slider_html += '<span class="slider-category-current current-' + value[0] + '">' + value[2] + commaSeparateNumber(value[4]) + ' to ' + value[2] + commaSeparateNumber(value[5]) + value[3] + '</span>';
            slider_html += '</span>';
            slider_html += '<div id="slider-' +  value[0] + '"></div>';
            slider_html += '<span class="average">';
            if (value[6] !== '') {
                slider_html += 'County average: ' + value[2] +  commaSeparateNumber(value[6]) +  value[3] + ' / '
            }
            slider_html += 'Entire state: ' + value[2] +  commaSeparateNumber(value[7]) +  value[3] + '</span>';
            slider_html += '</span>';
            
            // Append to newly created DIV
            $('.' + value[0] ).append(slider_html);

            // Create slider
            createSliders(value)

            // Close DIV
            $('.slider-details-box').append('</div>');
        }
     }, this);
// Close create sliders
}