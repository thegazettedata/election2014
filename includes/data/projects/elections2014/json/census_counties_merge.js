// Loop through GeoJSON file
for (var num = 0; num < iowa_counties.features.length; num ++) {
	// Loop through JSON file
	for (var num_two = 0; num_two < census_data.length; num_two ++) {

		// Match files based on property
		if (iowa_counties.features[num].properties["NAMELSAD10"] === census_data[num_two]["name"] ) {

		// Fields we want to merge from JSON file into GeoJSON file
		var census_fields = ['population', 'population_poverty', 'unemployment', 'median_age', 'male', 'male_percent', 'female', 'female_percent', 'median_household_income', 'poverty', 'poverty_percent', 'white', 'white_percent', 'black', 'black_percent', 'asian', 'asian_percent'];

			// Loop through fields
			for (var num_three = 0; num_three < census_fields.length; num_three ++) {
				// Add to GeoJSON file
				iowa_counties.features[num].properties[census_fields[num_three]] =  census_data[num_two][census_fields[num_three]]
			}
		}
	}
}

// Show on console
console.log(JSON.stringify(iowa_counties, null, 4))