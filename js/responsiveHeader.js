// Lock main nav on scroll down
$(window).load(function() {
    var ad_height = $('#LeaderboardTop').is(':visible') ? $('#LeaderboardTop').outerHeight(true) : 0;
    var midhead_height = $('#midhead').is(':visible') ? $('#midhead').outerHeight(true) : 0;
    var main_nav_top = ( ad_height + midhead_height );

    $(window).scroll(function () {
        var main_nav_locked = false;
        var current_spot = $(window).scrollTop();

        if(current_spot > main_nav_top && !main_nav_locked){
            $("#nav").addClass("locked");
            main_nav_locked = true;
        } else {
            $("#nav").removeClass("locked");
            main_nav_locked = false;
        }
    // Close scroll event
    });
// Close document ready
});