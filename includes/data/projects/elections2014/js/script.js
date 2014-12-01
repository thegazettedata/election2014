// Contains basic results information for the races at the top of the page
var races_displayed = {};

// Contains the county by county results for the races at the top of the page
var races_mappable = {
    'ussenate': {},
    'governor': {},
    'housedist1': {},
    'housedist2': {},
    'statesenate': {},
    'statehouse': {}
}

// Contains the other races that are in the table at the bottom of the page
var races_table = {};

// Backbone views
var raceboxesview;
var localracesview;

// Count down
function setCountDownClock() {
    var now = new Date();
        // 180000 milliseconds = 3 minutes
    var five_mins = new Date(now.getTime() + (180000));
    $('#refresh-countdown').countdown({until: five_mins, format: 'MS', compact: true});
}

// This sets the boxes at the top of page
// If State Senate or State House race
function setStateRaceBoxes(stateraces_reps, stateraces_dems, total_seats) {
    // Convert string to integer
    var reps = parseInt(stateraces_reps);
    var dems = parseInt(stateraces_dems);
    
    // Add 100 boxes
    for(var x = 1; x <= total_seats; x++){
        $("#displayedRacesBar").append("<div id='stateraces_seat_" + x + "' class='seat'></div>");
        if (total_seats === 50) {
            $("#stateraces_seat_" + x).css( 'width', '16.4px');
        } else if (total_seats === 100) {
            $("#stateraces_seat_" + x).css( 'width', '7.2px');
        }
    }

    // Style them either red or blue
    for(var w = 1; w <= reps; w++){
        $("#stateraces_seat_" + w).css("background-color", "#c01c0f").addClass('republicans');
    }

    // Start coloring the boxes from the right so we have blank ones in the middle
    // If we don't have 100 seats claimed yet
    for(var v = 1; v <= dems; v++){
        var value = total_seats + 1 - v;
        $("#stateraces_seat_" + value).css("background-color", "#154974").addClass('democrats');
    }
}

// Set the bars on the displayed race
// candidatevoteinfo[0] = candidatevotes['gop']
// candidatevoteinfo[1] = candidatepercent['gop']
// candidatevoteinfo[2] = candidatevotes_comma['gop']
// candidatevoteinfo[3] = candidatevotes['dem']
// candidatevoteinfo[4] = candidatepercent['dem']
// candidatevoteinfo[5] = candidatevotes_comma['dem']
function displayedRaceBars(candidatevoteinfo) {
    // Clear out DIV with our bars
    $('#displayedRacesBar').html('');

    // Total number of boxes depends on whether it's a Senate or House race
    // State Senate
    if ( Backbone.history.fragment === 'mapstatesenate') {
        // Set boxes in its place
        setStateRaceBoxes(candidatevoteinfo[0], candidatevoteinfo[3], 50);
    // State House
    } else if ( Backbone.history.fragment === 'mapstatehouse') {
        // Set boxes in its place
        setStateRaceBoxes(candidatevoteinfo[0], candidatevoteinfo[3], 100);
    // Otherwise create bars and not boxes
    } else {
        var left_right_bar = '<div class="leftBar" style="width:' + candidatevoteinfo[1] + '%">'
        left_right_bar += '<p>' + candidatevoteinfo[2] + ' votes</p>';
        left_right_bar += '</div>';
        left_right_bar += '<div class="rightBar" style="width:' + candidatevoteinfo[4] + '%">'
        left_right_bar += '<p>'  + candidatevoteinfo[5] + ' votes</p>';
        left_right_bar += '</div>';

        $('#displayedRace #displayedRacesBar').html(left_right_bar)
    }
// Close displayed race bars
}

// Send race data to Backbone
function raceDataBackbone(value, race_key, content_loaded) {
    // Used to flesh out models
    var candidate  = [];
    var candidate_lastname = [];
    var candidatevotes = [];
    var candidatevotes_comma = [];
    var candidatepercent = [];
    var candidatepercent_wording = [];
    var candidatewon = [];
    var gop_dem = false;

    // Pick only top two candidates for each
    // By looping throw the candidates array and selecting our two candidates
    _.each(value['CANDIDATEINFO']['CANDIDATE'], function (value_two, key_two) {
        // Capture candidate name
        var this_candidate = value_two['LAST_NAME'];

        // Pick just two candidates for each race
        // U.S. Senate
        if (race_key === 'U.S. Senate') {
            var gop = this_candidate.indexOf('Ernst') > -1;
            var dem = this_candidate.indexOf('Braley') > -1;
        // Governor
        } else if (race_key === 'Governor') {
            var gop = this_candidate.indexOf('Branstad') > -1;
            var dem = this_candidate.indexOf('Hatch') > -1;
        // House Dist. 1
        } else if (race_key === 'House Dist. 1') {
            var gop = this_candidate.indexOf('Blum') > -1;
            var dem = this_candidate.indexOf('Murph') > -1;
        // House Dist. 2
        } else if (race_key === 'House Dist. 2') {
            var gop = this_candidate.indexOf('Miller') > -1;
            var dem = this_candidate.indexOf('Loebsack') > -1;
        // State races
        } else if (race_key === 'State Senate' || race_key === 'State House') {
            // Set last name to first name if last name is null
            if (value_two['LAST_NAME'] === null || value_two['LAST_NAME'] === '' || value_two['LAST_NAME'] === ' ') {
                value_two['LAST_NAME'] = value_two['FIRST_NAME'];
                this_candidate = value_two['FIRST_NAME'];
                value_two['FIRST_NAME'] = '';
            }

            // Check to make sure wrong last name isn't being used
            if (this_candidate === 'GOP') {
                this_candidate = 'Republicans';
                value_two['LAST_NAME'] = 'Republicans';
            } else if (this_candidate === 'Dem') {
                this_candidate = 'Democrats';
                value_two['LAST_NAME'] = 'Democrats';
            }
            var gop = this_candidate.indexOf('Republicans') > -1;
            var dem = this_candidate.indexOf('Democrats') > -1;
        }

        // Replace nulls with zeros
        if (value_two['VOTE_TOTAL'] === null) {
            value_two['VOTE_TOTAL'] = 0;
        }
        if (value_two['PCT_TOTAL'] === null) {
            value_two['PCT_TOTAL'] = 0;
        }
        if (value_two['VOTE_TOTAL_COMMIFIED'] === null) {
            value_two['VOTE_TOTAL_COMMIFIED'] = 0;
        }
        if (value_two['WINNER'] === null) {
            value_two['WINNER'] = 'N';
        }

        // Use those to create displayed race, raceboxes models
        // Check for GOP
        if (gop || dem) {
            // Set variable so we only create models for top two candidates
            gop_dem = true;

            // Set party variable so we can set attributes for each candidate
            if (gop) {
                party = 'gop';
            } else if (dem) {
                party = 'dem'
            }

            // Catch candidates with no first names
            if (value_two['FIRST_NAME'] === null || value_two['FIRST_NAME'] === '' || value_two['FIRST_NAME'] === ' ') {
                candidate[party] = this_candidate;
            } else {
                candidate[party] = value_two['FIRST_NAME'] + ' ' + this_candidate;
            }
            candidate_lastname[party] = this_candidate;

            candidatevotes[party] = parseInt( value_two['VOTE_TOTAL'] );
            candidatevotes_comma[party] = value_two['VOTE_TOTAL_COMMIFIED'];
                
            // Change pct to actual votes in state races
            if ( race_key === 'State Senate' ) {
                // Add holdovers
                // GOP: 13
                if (gop) {
                    candidatevotes[party] = parseInt(value_two['VOTE_TOTAL']) + 13;
                    candidatepercent[party] = candidatevotes[party] * 2;
                    candidatepercent_wording[party] = candidatevotes[party] + ' seats';
                // Dem: 12
                 } else if (dem) {
                    candidatevotes[party] = parseInt(value_two['VOTE_TOTAL']) + 12;
                    candidatepercent[party] = candidatevotes[party] * 2;
                    candidatepercent_wording[party] = candidatevotes[party] + ' seats';
                }
                candidatevotes_comma[party] = commaSeparateNumber( candidatevotes[party] );
            } else if ( race_key === 'State House' ) {
                candidatepercent[party] = value_two['VOTE_TOTAL'];
                candidatepercent_wording[party] = candidatepercent[party] + ' seats';
            } else {
                candidatepercent[party] = value_two['PCT_TOTAL'];
                candidatepercent_wording[party] = candidatepercent[party] + '%';
            }

            candidatewon[party] = value_two['WINNER'];
        // Close if gop dem
        }
    }, this);

    // Only create models for top two candidates
    // i.e. Ernst and Braley
    if (gop_dem) {
        // Replace nulls with zeros
        if (value['RACEINFO']['PRECINCTS_REPORTING'] === null) {
            value['RACEINFO']['PRECINCTS_REPORTING'] = 0;
        }

        // Add racebox models if we're on initial load of app
        if (content_loaded === 'initial') {
            // Create new model for each racebox
            this.racebox = new RaceBox({
                race: race_key,
                leftcandidate: candidate['gop'],
                leftcandidatevotes: candidatevotes['gop'],
                leftcandidatepercent: candidatepercent['gop'],
                leftcandidatepercentstring: candidatepercent_wording['gop'],
                leftcandidatewon: candidatewon['gop'],
                rightcandidate: candidate['dem'],
                rightcandidatevotes: candidatevotes['dem'],
                rightcandidatepercent: candidatepercent['dem'],
                rightcandidatepercentstring: candidatepercent_wording['dem'],
                rightcandidatewon: candidatewon['dem'],
                precinctsin: value['RACEINFO']['PRECINCTS_REPORTING'],
                precinctstota$l: value['RACEINFO']['PRECINCTS_TOTAL'],
                url: $('#' + removeSpecialCharacters( race_key.toLowerCase() ) + '-selected-story').attr('href')
            });

            // Add to raceboxes collection
            raceboxes.add(this.racebox);
        // Otherwise set value of displayed race model
        // This is called when a reader clicks a racebox model
        // And switched out the displayed race
        } else if (content_loaded === 'displayedRace') {
            // Set displayed race model
            displayedrace.set({
                race: race_key,
                leftcandidate: candidate['gop'],
                leftcandidatephoto: candidate_lastname['gop'] + '.jpg',
                leftcandidatevotes: candidatevotes['gop'],
                leftcandidatepercent: candidatepercent['gop'],
                leftcandidatepercentstring: candidatepercent_wording['gop'],
                leftcandidatewon: candidatewon['gop'],
                rightcandidate: candidate['dem'],
                rightcandidatephoto: candidate_lastname['dem'] + '.jpg',
                rightcandidatevotes: candidatevotes['dem'],
                rightcandidatepercent: candidatepercent['dem'],
                rightcandidatepercentstring: candidatepercent_wording['dem'],
                rightcandidatewon: candidatewon['dem'],
                precinctsin: value['RACEINFO']['PRECINCTS_REPORTING'],
                precinctstotal: value['RACEINFO']['PRECINCTS_TOTAL'],
                url: $('#' + removeSpecialCharacters( race_key.toLowerCase() ) + '-selected-story').attr('href'),
                headline: $('#' + removeSpecialCharacters( race_key.toLowerCase() ) + '-selected-story').text()
            });

            // Show the displayed races bars at the top of the page
            var candidatevoteinfo = [candidatevotes['gop'], candidatepercent['gop'], candidatevotes_comma['gop'], candidatevotes['dem'], candidatepercent['dem'], candidatevotes_comma['dem']];
            displayedRaceBars(candidatevoteinfo);

        // Close if else initial, displayed race
        }
    // Close if gop dem
    }
// Close format JSON
}


// Loop through object containing the displayed race and raceboxes
// Then send to function that will add to Backbone
function setRaceboxes() {
    _.each(races_displayed, function (value, key) {
        raceDataBackbone(value, key, 'initial');
    }, this);
};

// Add senates not up for election to list
function senateNoElection() {
    // JSON variable has info on senators
    _.each(senate_races_no_election, function (value, key) {
       races_mappable['statesenate'][ value['RACE_NAME2'] ] = 
           {
               'RACEINFO': {
                   'RACE_NAME1': value['RACE_NAME1'],
                   'RACE_NAME2': value['RACE_NAME2'],
                   'PRECINCTS_TOTAL': value['PRECINCTS_TOTAL'],
                   'PRECINCTS_REPORTING': value['PRECINCTS_REPORTING'],
                   'PCT_PRECINCTS_REPORTING': value['PCT_PRECINCTS_REPORTING']
               },
               'CANDIDATEINFO': {
                   'CANDIDATE': {
                       'FIRST_NAME': value['FIRST_NAME'],
                       'LAST_NAME': value['LAST_NAME'],
                       'PARTY_ABBR': value['PARTY_ABBR']
                   }
               }
           }
    }, this); 
// Close senate no election
};

// Called if site has been iFramed within an article
function iframeStyles() {
    // This is loaded if inside iframe
    if ( window.self !== window.top ) {
        var hash_race = Backbone.history.fragment.replace('map', '').replace('demographics', '');
        
        $('body').css({
            'background-color': '#FFF'
        });
        $('.raceBox').click(function() {
            window.open('http://kcrg.com/elections', '_blank');
        });
        $('#header').hide();
        $('#aboveHeaderModules').hide();
        $('#maintable').css({
            'margin-top': '0px'
        });
        $('#election').css({
            'width': '98%',
            'padding': '0'
        });
        $('.page-title-box').hide();
        $('#video-explainer').hide();
        $('#refresh-countdown-container').hide();
        $('#refresh-countdown-update-container').css({
            'margin': '0px',
            'width': '100%'
        });
        $('#update-container').css({
            'width': '100%',
            'text-align': 'center'
        })
        $('#election #raceSelect').css({
            'margin-top': '0px'
        })
        $('#polls-close-container').hide();
        $('#raceSelect').css({
            'min-height': '0px'
        });
        $('#raceBoxes-container').css({
            'min-height': '0px'
        });
        $('#' + hash_race + ' .raceBox-container .coverageLink a').text('Comprehensive race results >>');
        $('#' + hash_race + ' .raceBox-container .coverageLink a').attr('href', 'http://kcrg.com/elections');
        
        if (Backbone.history.fragment.indexOf('demographics') === -1) {
            $('#' + hash_race + ' .raceBox-container .coverageLink').css({
                'font-size': '18px',
                'line-height': '25px'
            });
        }

        $('#' + hash_race).siblings().hide()
        $('#election .raceBox').css({
            'margin-bottom': '0px'
        });
        $('#election .raceBox .candidates .name').css({
            'margin': '0px'
        });
        $('#election .selected').show();
        $('#liveStreaming').hide();
        $('#localRaces').hide();
        $('#footer').hide();
        $('.show-race-text').css({
            'visibility': 'hidden',
            'height': '0px',
            'margin': '0px'
        });

        // County-level map
        if (Backbone.history.fragment.indexOf('demographics') > -1) {
            $('#update-container').hide();
            $('#map-container').show();
            $('#election #map').css({
                'width': '100%',
                'border-right': '0px solid #FFF'
            });

            // Create map and load data
            createMap();
            setMaps();

            var gop_candidate_first_last = $('#' + hash_race + ' .raceBox-container .candidates .leftCandidate h2').text();
            gop_candidate_first_last = gop_candidate_first_last.split(' ');
            var gop_candidate_last = gop_candidate_first_last[1];
            var dem_candidate_first_last = $('#' + hash_race + ' .raceBox-container .candidates .rightCandidate h2').text();
            dem_candidate_first_last = dem_candidate_first_last.split(' ');
            var dem_candidate_last = dem_candidate_first_last[1];

            $('#sidebar > div > div > table > tbody > tr > td:nth-child(1)').html('<span style="background-color:#c01c0f;"></span>' + gop_candidate_last + ' won');
            $('#sidebar > div > div > table > tbody > tr > td:nth-child(1)').css({
                'width': '49%'
            });
            $('#sidebar > div > div > table > tbody > tr > td:nth-child(2)').hide();
            $('#sidebar > div > div > table > tbody > tr > td:nth-child(3)').hide();
            $('#sidebar > div > div > table > tbody > tr > td:nth-child(4)').html('<span style="background-color:#154974;"></span>' + dem_candidate_last + ' won');
            $('#sidebar > div > div > table > tbody > tr > td:nth-child(4)').css({
                'width': '49%'
            });
            $('.colors').css({
                'width': '25%',
                'float': 'center'
            });

            console.log('new');

            $('#county-breakdown').show();
            $('.show-county-breakdown-text').show();
            intializeSliders();


            $('#county-breakdown').css({
                'margin-top': '0px'
            })
            $('.average').hide();
            $('#election .fa-check-left').hide();
            $('#election #raceSelect .fa-check-square + div').css({
                'width': '100%'
            });
            $('#map-container').css({
                'position': 'absolute',
                'width': '98%',
                'top': '90px',
                'margin-left': '0%'
            });
            $('#raceSelect').css({
                'position': 'absolute',
                'width': '98%'
            });
            $('.show-county-breakdown-text').css({
                'position': 'absolute',
                'top': '430px'
            });
            $('#county-breakdown').css({
                'position': 'absolute',
                'width': '98%',
                'top': '470px'
            });
            $('.slider-category').css({
                'margin-top': '5px',
                'float': 'left',
                'width': '90%',
                'margin-left': '5%'
            })
        }
    }
};

// Makes the getJSON call
function getJSON(state) {
    // Test data: /Includes/data/projects/elections2014/json/elections.json
    $.getJSON( "elections.json", function( data ) {
        // Note on page when data was last updated
        var updated = new Date( data['DATA']['RUN_DATE']);
        var minutes = (updated.getMinutes()<10?'0':'') + updated.getMinutes();

        if (updated.getHours() > 12 ) {
            var time = updated.getHours() - 12 + ':' + minutes + ' p.m.';
        } else if (updated.getHours() === 12 ) {
            var time = updated.getHours() + ':' + minutes + ' p.m.';
        } else if (updated.getHours() === 0 ) {
            var time = '12:' + minutes + ' a.m.';
        } else {
            var time = updated.getHours() + ':' + minutes + ' a.m.';
        }
        var updated_format = time;
        $('#update').html(updated_format);

        _.each(data['DATA']['RACE'], function (value, key) {
            var race_info = value['RACE_INFO'];
            var race_name_one = race_info['RACE_NAME1'];
            var race_name_two = race_info['RACE_NAME2'];
            var candidate_info = value['CANDIDATE_INFO'];

            // Grab our races
            // Races at the top of the page
            // Senate
            if ( race_name_one.indexOf('IA Senate 2014 CntyLong') > -1 && race_name_two.indexOf('Totals') > -1 ) {
                races_displayed['U.S. Senate'] = {'RACEINFO': race_info, 'CANDIDATEINFO': candidate_info};
            // Senate
            } else if ( race_name_one.indexOf('State of Iowa') > -1 && race_name_two.indexOf('Governor') > -1 ) {
                races_displayed['Governor'] = {'RACEINFO': race_info, 'CANDIDATEINFO': candidate_info};
            // House Dist. 1
            } else if ( race_name_one.indexOf('U.S. House') > -1 && race_name_two.indexOf('District 1') > -1 ) {
                races_displayed['House Dist. 1'] = {'RACEINFO': race_info, 'CANDIDATEINFO': candidate_info};
            // House Dist. 2
            } else if (race_name_one.indexOf('U.S. House') > -1 && race_name_two.indexOf('District 2') > -1 ) {
                races_displayed['House Dist. 2'] = {'RACEINFO': race_info, 'CANDIDATEINFO': candidate_info};
            // State Senate
            } else if (race_name_one.indexOf('IA StSen Trend_Won') > -1 ) {
                races_displayed['State Senate'] = {'RACEINFO': race_info, 'CANDIDATEINFO': candidate_info};
            } else if (race_name_one.indexOf('Iowa Senate') > -1 && race_name_two.indexOf('Balance of Power') > -1) {
                races_displayed['State Senate'] = {'RACEINFO': race_info, 'CANDIDATEINFO': candidate_info};
            // State House
            } else if (race_name_one.indexOf('IA StHou Trend_Won') > -1 ) {
                races_displayed['State House'] = {'RACEINFO': race_info, 'CANDIDATEINFO': candidate_info};
            } else if (race_name_one.indexOf('Iowa House') > -1 && race_name_two.indexOf('Balance of Power') > -1) {
                races_displayed['State House'] = {'RACEINFO': race_info, 'CANDIDATEINFO': candidate_info};

            // Races we're mapping
            // Senate
            } else if (race_name_one.indexOf('IA Senate 2014 CntyLong') > -1) {
                if (race_name_two !== undefined && race_name_two !== null && race_name_two !== '' && race_name_two !== ' ') {
                    races_mappable['ussenate'][race_name_two] = {'RACEINFO': race_info, 'CANDIDATEINFO': candidate_info};
                }
            // Governor
            } else if (race_name_one.indexOf('IA Gov Cnty') > -1) {
                race_name_split = race_name_one.split('IA Gov Cnty_');
                // Fill missing data
                _.each(candidate_info['CANDIDATE'], function (value, key) {
                    if (value['LAST_NAME'] === 'Hatch') {
                        value['FIRST_NAME'] = 'Jack';
                        value['LAST_NAME'] = 'Hatch';
                        value['INCUMBENT'] = 'N';
                        value['PARTY_ABBR'] = 'D';
                    } else if (value['LAST_NAME'] === 'Branstad') {
                        value['FIRST_NAME'] = 'Terry';
                        value['LAST_NAME'] = 'Branstad';
                        value['INCUMBENT'] = 'Y';
                        value['PARTY_ABBR'] = 'R';
                    }
                }, this);

                // Find county name misspellings
                if (race_name_split[1] === 'CeroGrdo') {
                    race_name_split[1] = 'Cerro Gordo'
                } else if (race_name_split[1] === 'BuenaVst') {
                    race_name_split[1] = 'Buena Vista'
                } else if (race_name_split[1] === 'Potwtmie') {
                    race_name_split[1] = 'Pottawattamie'
                }

                races_mappable['governor'][race_name_split[1]] = {'RACEINFO': race_info, 'CANDIDATEINFO': candidate_info};
            // House Dist. 1
            } else if (race_name_one.indexOf('IA House 1 CntyLong') > -1) {
                if (race_name_two !== undefined && race_name_two !== null && race_name_two !== '' && race_name_two !== ' ') {
                    races_mappable['housedist1'][race_name_two] = {'RACEINFO': race_info, 'CANDIDATEINFO': candidate_info};
                }
            // House Dist. 2
            } else if (race_name_one.indexOf('IA House 2 CntyLong') > -1) {
                if (race_name_two !== undefined && race_name_two !== null && race_name_two !== '' && race_name_two !== ' ') {
                    races_mappable['housedist2'][race_name_two] = {'RACEINFO': race_info, 'CANDIDATEINFO': candidate_info};
                }
            // State Senate
            } else if (race_name_one.indexOf('IA StSen Contested') > -1) {
                if (race_name_two !== undefined && race_name_two !== null && race_name_two !== '' && race_name_two !== ' ') {
                    races_mappable['statesenate'][race_name_two] = {'RACEINFO': race_info, 'CANDIDATEINFO': candidate_info};
                }
            } else if (race_name_one.indexOf('Iowa Senate') > -1 && race_name_two.indexOf('Balance of Power') === -1) {
                if (race_name_two !== undefined && race_name_two !== null && race_name_two !== '' && race_name_two !== ' ') {
                    races_mappable['statesenate'][race_name_two] = {'RACEINFO': race_info, 'CANDIDATEINFO': candidate_info};
                }
            // State House
            } else if (race_name_one.indexOf('IA StHou Contested') > -1) {
                if (race_name_two !== undefined && race_name_two !== null && race_name_two !== '' && race_name_two !== ' ') {
                    races_mappable['statehouse'][race_name_two] = {'RACEINFO': race_info, 'CANDIDATEINFO': candidate_info};
                }
            } else if (race_name_one.indexOf('Iowa House') > -1 && race_name_two.indexOf('Balance of Power') === -1) {
                if (race_name_two !== undefined && race_name_two !== null && race_name_two !== '' && race_name_two !== ' ') {
                    races_mappable['statehouse'][race_name_two] = {'RACEINFO': race_info, 'CANDIDATEINFO': candidate_info};
                }
            
            // All other races
            // To be put in the table
            } else if (race_name_one.indexOf('IA') === -1 && race_name_one.indexOf('U.S. Senate') === -1) {
                races_table[race_name_one + ' ' + race_name_two] = {'RACEINFO': race_info, 'CANDIDATEINFO': candidate_info};
            }

        }, this);

        // If we're loading the page for the first time
        // Do all this
        if (state === 'doc ready') {
            // Add Senate seats that aren't up for election
            senateNoElection();

            // Loop through object we just created
            setRaceboxes();

            // Fire up Backbone
            Backbone.history.start();

            // Initialize raceboxes collection view after models have been added to it
            raceboxesview = new RaceBoxesView({collection: raceboxes});

            // Initialize localraces view after JSON is loaded
            localracesview = new LocalRacesView({model: localraces});

            // Hide the racebox that's also the displayed race by default
            if ( $(window).width() > 800 ) {
                $( '#' + Backbone.history.fragment.replace('map', '') ).addClass('selected');
            }

            // Set countdown clock to five minutes
            // setCountDownClock();

            // This is called if we're in an iframe
            // Used within stories
            iframeStyles();
        }
    });
// Close get json
};

// Reset all the data on the page
function resetPage() {
    // Start load spinner
    spinner.spin(target);

    // Load JSON
    getJSON('not initial');
    
    // Set displayed race
    setDisplayedRace();
    
    // Reset raceboxes collection and render
    raceboxes.reset();
    setRaceboxes();
    $('#raceBoxes-container').html('');
    raceboxesview.render();

    // Hide the racebox that's also the displayed race by default
    if ( $(window).width() > 800 ) {
        $( '#' + Backbone.history.fragment.replace('map', '') ).addClass('selected');
    }

    // Load maps
    setMaps();

    // Reset local races table and render
    localraces_datatable.destroy();
    $('#searchable-table tbody').html('');
    localracesview.render();

    // Reset countdown clock
    // $('#refresh-countdown').countdown('destroy');
    // setCountDownClock();

    // This is called if we're in an iframe
    // Used within stories
    iframeStyles();
};

// Refresh the page every five minutes
// 180000 milliseconds = 3 minutes
// setInterval(function() {
//     resetPage();
// }, 180000);

// DOCUMENT READY
$(document).ready(function() {
    // call get JSON
    getJSON('doc ready');
});

var videoNotShown = true;
$("#about-box").click(function(){
    if(videoNotShown){
        videoNotShown = false;
        $("#about-box").html("<i class='fa fa-info-circle'></i> Hide the video");
    }
    else{
        $("#about-box").html("<i class='fa fa-info-circle'></i> About this page")
        videoNotShown = true;
    }
    $(".video-box").slideToggle( "slow", function() {
    // Animation complete.
  });
});


