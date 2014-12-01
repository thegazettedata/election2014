var localraces_datatable;
var datatable_data;

// DataTables formatting options
// More options: http://datatables.net/plug-ins/sorting

// Formatted numbers: i.e. numbers with commas
jQuery.extend( jQuery.fn.dataTableExt.oSort, {
    "formatted-num-pre": function ( a ) {
        a = (a === "-" || a === "") ? 0 : a.replace( /[^\d\-\.]/g, "" );
        return parseFloat( a );
    },
    "formatted-num-asc": function ( a, b ) {
        return a - b;
    },
    "formatted-num-desc": function ( a, b ) {
        return b - a;
    }
});
// Currency
jQuery.extend( jQuery.fn.dataTableExt.oSort, {
    "currency-pre": function ( a ) {
        a = (a==="-") ? 0 : a.replace( /[^\d\-\.]/g, "" );
        return parseFloat( a );
    },
    
    "currency-asc": function ( a, b ) {
        return a - b;
    },
    
    "currency-desc": function ( a, b ) {
        return b - a;
    }
});
// Percentages
jQuery.extend( jQuery.fn.dataTableExt.oSort, {
    "percent-pre": function ( a ) {
        var x = (a == "-") ? 0 : a.replace( /%/, "" );
        return parseFloat( x );
    },
 
    "percent-asc": function ( a, b ) {
        return ((a < b) ? -1 : ((a > b) ? 1 : 0));
    },
 
    "percent-desc": function ( a, b ) {
        return ((a < b) ? 1 : ((a > b) ? -1 : 0));
    }
});

// Custom filter
$.fn.dataTable.ext.search.push(
    function( settings, data, dataIndex ) {
        return true
    }
);

// Model for our displayed race
var LocalRaces = Backbone.Model.extend({});

// View for displayed race
var LocalRacesView = Backbone.View.extend({
    initialize: function() {
        this.render();
    },

    // Render Handlebars template
    render: function() {
        var source = $('#datatable-template').html();
        var handlebarscompile = Handlebars.compile(source);

        // Loop through JSON data and append to table
        _.each(races_table, function (value, key) {
            var rendered = handlebarscompile( value );
            
            // Collect most important races
            if (key.indexOf('State of Iowa') > -1 || key.indexOf('U.S. House') > -1) {
                $('#searchable-table tbody').prepend( rendered );
            } else {
                $('#searchable-table tbody').append( rendered );
            }
        }, this);

        // Call DataTables
        this.loadDataTable();

        return this;
    },

    // Create DataTable out of table
    loadDataTable: function() {
        // Load Datatables after Tabletop is loaded
        localraces_datatable = $('#searchable-table').DataTable({
            "bAutoWidth": false,
            "bSort" : false,
            "oLanguage": {
                "sLengthMenu": "_MENU_ records per page"
            },
            "columnDefs": [
                { "visible": false, "targets": 0 },
                { "visible": false, "targets": 1 },
                { "visible": false, "targets": 2 }
            ],
            "iDisplayLength": 25,
            "aoColumns": [
                {
                    "sWidth": "1%"
                },{
                    "sWidth": "1%"
                },{
                    "sWidth": "1%"
                },{
                    "sWidth": "30%",
                    "bSortable": false
                },{
                    "sWidth": "5%",
                    "bSortable": false
                },{
                    "sWidth": "20%",
                    "bSortable": false
                },{
                    "sWidth": "20%",
                    "bSortable": false
                },{
                    "sWidth": "22%",
                    "bSortable": false
                }
            ],
            "drawCallback": function ( settings ) {
                var api = this.api();
                var rows = api.rows( {page:'current'} ).nodes();
                var last = null;
                datatable_data = api.data();

                var races = api.column(0, {page:'current'} ).data();
                var precinctsin =  api.column(1, {page:'current'} ).data();
                var precinctstotal =  api.column(2, {page:'current'} ).data();

                races.each( function ( group, i ) {
                    if ( last !== group ) {
                        // Add row that says the race before the rows of candidates

                        // Don't show precincts box if we don't have precincts
                        if (precinctstotal[i] === '0' || precinctstotal[i] === '0') {
                            $(rows).eq( i ).before(
                                '<tr class="group"><td colspan="5"><a href="#"><span class="races-box">' + group + '</span></a></td></tr>'
                            );
                        } else {
                            // Nulls to zeroes
                            if (precinctsin[i] === ' ' || precinctsin[i] === '' || precinctsin[i] === null) {
                                precinctsin[i] = 0;
                            }

                            $(rows).eq( i ).before(
                                '<tr class="group"><td colspan="5"><a href="#"><span class="races-box">' + group + '</span></a><span class="precincts-box">' + commaSeparateNumber(precinctsin[i]) + ' / ' + commaSeparateNumber(precinctstotal[i]) + ' precincts in</span></td></tr>'
                            );
                        }
                        last = group;
                    }
                });
            },
            // Fix thead to top of page when scrolling past it
            "initComplete": function(settings, json) {
                $('#searchable-table').show();
            }
        });

        return this
    // Close loadDataTable
    }
});

// Create instance of model
var localraces = new LocalRaces();