$(window).load(function() {

	if ( $('#body-content').length ){
        var paraDistance = ( $('#body-content').position().top );
    } else  if ( $('#maintable').length ) {
        var paraDistance = ( $('#maintable').position().top )
    } else {
        var paraDistance = 0;
    }

	$(window).scroll(function () {
		var switched = false;
    	var currentSpot = $(window).scrollTop();

    	if(currentSpot > paraDistance && !switched){
            $("#icon").attr("src", "/images/logo-small.jpg");

    		if ( $("#mobile-posttitle").length ){
                var headline = $("#mobile-posttitle").text();
            } else  {
                var headline = $("#mobile-posttitle-default").text();           
            }

    		$("#responsive #header-mobile h1").html(headline);
    		
            var windowsize = $( window ).width();
            if (windowsize < 601) {
                $("#sections h3").css("display", "none");
                $("#sections").css("width", "22px");
    		}
            
            switched = true;
    	}
    	else{
    		$("#responsive #header-mobile h1").html("");
    		$("#icon").attr("src", "/images/logo-big.jpg");
            $("#sections").css("width", "85px");
    		$("#sections h3").css("display", "block");
    		switched = true;
    	}
	});

    var sectionsActive = false;
    $("#sections").click(function(){
    	if(sectionsActive === false){
    		$("#nav-mobile").css("display","block");
    		$("#sections").addClass("selected");
    		sectionsActive = true;
    	}
    	else{
    		$("#nav-mobile").css("display","none");
    		$("#sections").removeClass("selected");
    		sectionsActive = false;
    	}

    });

});