// Model for our raceboxes
var RaceBox = Backbone.Model.extend({});

// Collection for all the raceboxes
var RaceBoxes = Backbone.Collection.extend({
    model: RaceBox
});

// Create instance of model, view and collection
var racebox = new RaceBox();
var raceboxes = new RaceBoxes();

// View for raceboxes collection
// Will be initialized after models are added to it
var RaceBoxesView = Backbone.View.extend({
    initialize: function() {
        this.render();
        this.collection.bind('change', this.render);
    },

    // Render the collection onto the page
    render: function(racebox) {
        // Handlebars template
        var source = $('#raceBoxes-template').html();
        var handlebarscompile = Handlebars.compile(source);

        // Loop through the collection and append each to the DOM
        raceboxes.each(function (racebox) {
            // Handlebars compiled
            var rendered = handlebarscompile( racebox.attributes );
            $('#raceBoxes-container').append( rendered );
        }, this);
    }
});