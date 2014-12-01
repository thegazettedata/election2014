// FUNCTIONS
// Used to capitalize first letter of string
function capitaliseFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
};

// Used to capitalize first letter of all words
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
    	first_letter = txt.charAt(0).toUpperCase();

    	// This captures words with an apostrophe as the second character
    	// And capitalizes them correctly
    	// Example: o'brien = O'Brien
    	if (txt.charAt(1) === "'") {
    		return first_letter + txt.charAt(1) + txt.charAt(2).toUpperCase() + txt.substr(3).toLowerCase();
    	} else {
    		return first_letter + txt.substr(1).toLowerCase();
    	}
    });
}

// Add commas to numbers over 1000
function commaSeparateNumber(val){
	while (/(\d+)(\d{3})/.test(val.toString())){
		val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
	}
	return val;
}

// This removes special characters and spaces
function removeSpecialCharacters(string) {
    return string.replace(/[^\w\s]/gi, '').replace(/ /g,'');
}

// Handlebars helpers
Handlebars.registerHelper('removespecial', function(options) {
  return removeSpecialCharacters( options.fn(this).toLowerCase() );
});

Handlebars.registerHelper('commaseparated', function(options) {
    return commaSeparateNumber( options.fn(this) );
});

// Put checkbox on page if candidate won
// Displayed race and raceboxes
Handlebars.registerHelper('checkboxraceboxes', function(options) {
    var checkbox_options = options.fn(this).split(' ');
    var type_race = checkbox_options[0];
    var leftcandidatewon = checkbox_options[1];
    var rightcandidatewon = checkbox_options[2];

    // Check if precincts in are the same as the total precincts
    if (leftcandidatewon !== 'N' || rightcandidatewon !== 'N') {
        if (leftcandidatewon === "Y" || leftcandidatewon === "Z") {
            var icon_float = 'fa-check-left';
        } else if (rightcandidatewon === "Y" || rightcandidatewon === "Z") {
            var icon_float = 'fa-check-right'
        }

        // Determine size of the icons by the first parameter
        if (type_race === 'displayedRace') {
            var icon_size = 'fa-3x';
        } else {
            var icon_size = 'fa-2x';
        }

        // Return square
        return '<div class="fa fa-check-square ' + icon_float + ' ' + icon_size + '" style="display:block;"></div>';
    }
});

// Put checkbox on page if candidate won
// DataTable
Handlebars.registerHelper('checkboxdatatable', function(options) {
    if (options.fn(this) === 'Y' ) {
        return '<div class="fa fa-check-square fa-check-left" style="display:block;"></div>';
    }
});

// Show red R's and blue B's
Handlebars.registerHelper('colorcheck', function(options) {
    if (options.fn(this) === 'R') {
        return '<span style="color: #c01c0f; font-weight: bold;">' + options.fn(this) + '</span>';
    } else if (options.fn(this) === 'D') {
        return '<span style="color:#154974; font-weight: bold;">' + options.fn(this) + '</span>';
    } else {
        return '<span style="color:#555; font-weight: bold;">' + options.fn(this) + '</span>';
    }
});

// Turn nulls into zeros
Handlebars.registerHelper('nullcheck', function(options) {
    if (options.fn(this) === null || options.fn(this) === '' || options.fn(this) === ' ') {
        return 0;
    } else {
        return commaSeparateNumber( parseInt(options.fn(this)) );
    }
});

// Show barcharts
Handlebars.registerHelper('barchart', function(options) {
    var party_votes = options.fn(this).split(' ');
    var party = party_votes[0];
    if (party_votes[1] === '' || party_votes[1] === ' ' || party_votes[1] === null ) {
        var candidate_pct = 0;
    } else {
        var candidate_pct = parseInt( party_votes[1] );
    }

    // Determine color of the bar
    if (party === 'R') {
        var bar_color = '#c01c0f';
    } else if (party === 'D') {
        var bar_color = '#154974';
    } else {
        var bar_color = '#555';
    }

    return '<div class="bar" style="width:' + candidate_pct + '%; background-color: ' + bar_color + '"></div>';
});


Handlebars.registerHelper('precinctscheck', function(options) {
    var precinct_options = options.fn(this).split(' ');
    var race = precinct_options[0];
    var precinctsin = precinct_options[1];
    var precinctstotal = precinct_options[2];

    if (race !== 'statesenate' && race !== 'statehouse') {
        return commaSeparateNumber(precinctsin) + ' / ' + commaSeparateNumber(precinctstotal) + ' precincts reported';
    }
});