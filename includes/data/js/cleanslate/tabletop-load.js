// URL beginning and end, which will be used with the key
// To give Tabletop a URL
var google_docs_one = 'https://docs.google.com/spreadsheet/pub?hl=en_US&hl=en_US&key=';
var google_docs_two = '&output=html';

// Google Docs spreadsheet key
var spreadsheet_key = '1wzUwArQsdQ7kPodzwrUtZ-QCWd9pVrfNVO4V0u3ZyPc';

// Template sources and what DIVs they will appear in
var templates = [
    {
        "templatesource": "#content-template",
        "templatehtml": "#content-box",
        "sheet": "Sheet1"
    }
];

// Use Handlebars to load data from Tabletop to page
function loadToDOM(tabletop_data, tabletop) {
	// Loop through templates
    _.each(templates, function(element, num_templates) {
    	// Grab HTML of template and compile with Handlebars
    	var template_html = element['templatehtml'];    
    	var source = $(element["templatesource"] + "").html();
        var sheet = element["sheet"];
    	var handlebarscompile = Handlebars.compile(source);

		// Render the templates onto page
		$(template_html).append(handlebarscompile( tabletop.sheets(sheet) ));
	// Close each statement
    }, this);
}


// Pull data from Google spreadsheet via Tabletop
function initializeTabletopObject(){
	Tabletop.init({
    	key: google_docs_one + spreadsheet_key + google_docs_two,
    	callback: loadToDOM,
    	simpleSheet: false,
    	debug: false
    });
}

// Load Tabletop
initializeTabletopObject();