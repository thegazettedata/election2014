// Model for our displayed race
var DisplayedRace = Backbone.Model.extend({});

// View for displayed race
var DisplayedRaceView = Backbone.View.extend({
    initialize: function() {
        this.model.bind('change', this.render);
    },

    // Render Handlebars template
    render: function() {
        var source = $('#displayedRace-template').html();
        var handlebarscompile = Handlebars.compile(source);
        var rendered = handlebarscompile( this.attributes );
        $('#displayedRace').html( rendered );

        return this;
    }
});

// Create instances of model, view
var displayedrace = new DisplayedRace();
var displayedraceview = new DisplayedRaceView({model: displayedrace});