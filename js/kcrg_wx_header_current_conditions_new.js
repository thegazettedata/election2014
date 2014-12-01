String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};


var SmgHeaderConditionsBuilder = function($, conditions) {
    this.$ = $;
    this.conditions = conditions;
};

SmgHeaderConditionsBuilder.prototype.buildDate = function() {
    var months = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
    var days = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");
    var d = new Date();
    var curr_weekday = d.getDay();
    var curr_day = d.getDate();
    var curr_month = d.getMonth();
    var curr_year = d.getFullYear();
    var dateElement = $("<div />").addClass("date").html(days[curr_weekday] + ", " + months[curr_month] + " " + curr_day + ", " + curr_year);
    return dateElement;
};

SmgHeaderConditionsBuilder.prototype.buildLink = function(){
    var link = $("<a></a>").html("Full Forecast &raquo;").attr({
        href:"http://kcrg.com/weather"
    });
    return link;
};

SmgHeaderConditionsBuilder.prototype.buildBlock = function(condition){
    var blockElement = $("<div/>").addClass("date-wrapper");
    blockElement.append(this.buildDate());
    blockElement.append(this.buildLink());
    blockElement.append($("<div />").addClass("clear"));
    return blockElement;
};

SmgHeaderConditionsBuilder.prototype.buildContent = function(condition){
    var dataContent = $("<div/>").addClass("content-wrapper");
    dataContent.append(this.buildBlock(condition));
    $(".date-weather").append(dataContent);
}

SmgHeaderConditionsBuilder.prototype.buildHeaderConditions = function(city) {
    $(".date-weather").html("");
    this.buildContent(this.conditions[city].condition);
};

SmgHeaderConditionsBuilder.prototype.setWeatherCookie = function(city) {
    document.cookie = document.cookie.replace(/kcrgHeaderWeatherCity=([a-z\s]+|);?/gi, "");
    document.cookie = document.cookie.replace(/expires=([a-z1-9\s:,]+|);?/gi, "");
    var now = new Date();
    now.setFullYear(now.getFullYear() + 1);
    document.cookie = "kcrgWeatherCity=" + city + ";expires=" + now.toUTCString() + ";path=/";
};

SmgHeaderConditionsBuilder.prototype.readWeatherCookie = function() {
    var cookieArray = document.cookie.split(";");
    for (var x=0; x< cookieArray.length; x++) {
        var valueArray = cookieArray[x].split("=");
        if (valueArray.length == 2) {
            var key = valueArray[0].replace(/^\s*/, '').replace(/\s*$/, '');
            var value = valueArray[1].replace(/^\s*/, '').replace(/\s*$/, '');
            if (key === "kcrgWeatherCity") {
                return value;
            }
        }
    }
};

var conditions = {"Iowa Falls":{"condition":{"wind_mph":0,"weather_icon_id":130,"pressure_mb":null,"is_active":true,"wind_kt":0,"station_id":10,"relative_humidity":89,"source":"","temperature_f":73,"temperature_c":23,"current_condition":"Fair","pressure_in":29.94,"visibility_mi":10,"dewpoint_f":69,"dewpoint_c":21,"created_at":"2013-08-28T01:15:10-05:00","updated_at":"2013-08-28T01:15:10-05:00","id":247026,"wind_direction":"North"}},"Oelwein":{"condition":{"wind_mph":4,"weather_icon_id":130,"pressure_mb":null,"is_active":true,"wind_kt":4,"station_id":8,"relative_humidity":89,"source":"","temperature_f":77,"temperature_c":25,"current_condition":"Fair","pressure_in":29.92,"visibility_mi":10,"dewpoint_f":73,"dewpoint_c":23,"created_at":"2013-08-28T01:15:09-05:00","updated_at":"2013-08-28T01:15:09-05:00","id":247024,"wind_direction":"West"}},"Mount Pleasant":{"condition":{"wind_mph":8,"weather_icon_id":130,"pressure_mb":null,"is_active":true,"wind_kt":7,"station_id":14,"relative_humidity":65,"source":"","temperature_f":76,"temperature_c":24,"current_condition":"Fair","pressure_in":29.95,"visibility_mi":10,"dewpoint_f":63,"dewpoint_c":17,"created_at":"2013-08-28T01:15:10-05:00","updated_at":"2013-08-28T01:15:10-05:00","id":247030,"wind_direction":"Southwest"}},"Vinton":{"condition":{"wind_mph":17,"weather_icon_id":1,"pressure_mb":null,"is_active":true,"wind_kt":15,"station_id":13,"relative_humidity":49,"source":"","temperature_f":91,"temperature_c":32,"current_condition":"Fair","pressure_in":29.93,"visibility_mi":10,"dewpoint_f":69,"dewpoint_c":20,"created_at":"2013-08-28T01:15:10-05:00","updated_at":"2013-08-28T01:15:10-05:00","id":247029,"wind_direction":"Southwest"}},"Marshalltown":{"condition":{"wind_mph":3,"weather_icon_id":130,"pressure_mb":1012,"is_active":true,"wind_kt":3,"station_id":12,"relative_humidity":84,"source":"","temperature_f":75,"temperature_c":23,"current_condition":"Fair","pressure_in":29.92,"visibility_mi":10,"dewpoint_f":70,"dewpoint_c":21,"created_at":"2013-08-28T01:15:10-05:00","updated_at":"2013-08-28T01:15:10-05:00","id":247028,"wind_direction":"West"}},"Monticello":{"condition":{"wind_mph":8,"weather_icon_id":130,"pressure_mb":null,"is_active":true,"wind_kt":7,"station_id":9,"relative_humidity":79,"source":"","temperature_f":79,"temperature_c":26,"current_condition":"Fair","pressure_in":29.9,"visibility_mi":10,"dewpoint_f":71,"dewpoint_c":22,"created_at":"2013-08-28T01:15:09-05:00","updated_at":"2013-08-28T01:15:09-05:00","id":247025,"wind_direction":"West"}},"Washington":{"condition":{"wind_mph":8,"weather_icon_id":1,"pressure_mb":null,"is_active":true,"wind_kt":7,"station_id":6,"relative_humidity":62,"source":"","temperature_f":84,"temperature_c":29,"current_condition":"Fair","pressure_in":30.16,"visibility_mi":10,"dewpoint_f":69,"dewpoint_c":21,"created_at":"2013-08-28T01:15:09-05:00","updated_at":"2013-08-28T01:15:09-05:00","id":247022,"wind_direction":"Southwest"}},"Waterloo":{"condition":{"wind_mph":6,"weather_icon_id":130,"pressure_mb":1011,"is_active":true,"wind_kt":6,"station_id":4,"relative_humidity":76,"source":"","temperature_f":80,"temperature_c":26,"current_condition":"Fair","pressure_in":29.9,"visibility_mi":10,"dewpoint_f":72,"dewpoint_c":22,"created_at":"2013-08-28T01:15:09-05:00","updated_at":"2013-08-28T01:15:09-05:00","id":247020,"wind_direction":"West"}},"Grinnell":{"condition":{"wind_mph":8,"weather_icon_id":130,"pressure_mb":null,"is_active":true,"wind_kt":7,"station_id":11,"relative_humidity":78,"source":"","temperature_f":75,"temperature_c":23,"current_condition":"Fair","pressure_in":29.94,"visibility_mi":10,"dewpoint_f":67,"dewpoint_c":19,"created_at":"2013-08-28T01:15:10-05:00","updated_at":"2013-08-28T01:15:10-05:00","id":247027,"wind_direction":"Southwest"}},"Oskaloosa":{"condition":{"wind_mph":4,"weather_icon_id":130,"pressure_mb":null,"is_active":true,"wind_kt":4,"station_id":7,"relative_humidity":77,"source":"","temperature_f":72,"temperature_c":22,"current_condition":"Fair","pressure_in":29.95,"visibility_mi":10,"dewpoint_f":64,"dewpoint_c":18,"created_at":"2013-08-28T01:15:09-05:00","updated_at":"2013-08-28T01:15:09-05:00","id":247023,"wind_direction":"Southwest"}},"Cedar Rapids":{"condition":{"wind_mph":8,"weather_icon_id":130,"pressure_mb":1011,"is_active":true,"wind_kt":7,"station_id":1,"relative_humidity":67,"source":"","temperature_f":79,"temperature_c":26,"current_condition":"Fair","pressure_in":29.91,"visibility_mi":10,"dewpoint_f":66,"dewpoint_c":19,"created_at":"2013-08-28T01:15:08-05:00","updated_at":"2013-08-28T01:15:08-05:00","id":247017,"wind_direction":"Southwest"}},"Clinton":{"condition":{"wind_mph":8,"weather_icon_id":130,"pressure_mb":null,"is_active":true,"wind_kt":7,"station_id":17,"relative_humidity":74,"source":"","temperature_f":75,"temperature_c":24,"current_condition":"Fair","pressure_in":29.93,"visibility_mi":10,"dewpoint_f":66,"dewpoint_c":19,"created_at":"2013-08-28T01:15:10-05:00","updated_at":"2013-08-28T01:15:10-05:00","id":247033,"wind_direction":"West"}},"Fairfield":{"condition":{"wind_mph":6,"weather_icon_id":130,"pressure_mb":null,"is_active":true,"wind_kt":6,"station_id":16,"relative_humidity":69,"source":"","temperature_f":75,"temperature_c":24,"current_condition":"Fair","pressure_in":29.95,"visibility_mi":10,"dewpoint_f":64,"dewpoint_c":18,"created_at":"2013-08-28T01:15:10-05:00","updated_at":"2013-08-28T01:15:10-05:00","id":247032,"wind_direction":"Southwest"}},"Independence":{"condition":{"wind_mph":4,"weather_icon_id":130,"pressure_mb":null,"is_active":true,"wind_kt":4,"station_id":15,"relative_humidity":83,"source":"","temperature_f":73,"temperature_c":23,"current_condition":"Fair","pressure_in":29.92,"visibility_mi":10,"dewpoint_f":68,"dewpoint_c":20,"created_at":"2013-08-28T01:15:10-05:00","updated_at":"2013-08-28T01:15:10-05:00","id":247031,"wind_direction":"West"}},"Iowa City":{"condition":{"wind_mph":0,"weather_icon_id":130,"pressure_mb":1012,"is_active":true,"wind_kt":0,"station_id":2,"relative_humidity":67,"source":"","temperature_f":79,"temperature_c":26,"current_condition":"Fair","pressure_in":29.92,"visibility_mi":10,"dewpoint_f":66,"dewpoint_c":19,"created_at":"2013-08-28T01:15:08-05:00","updated_at":"2013-08-28T01:15:08-05:00","id":247018,"wind_direction":"North"}},"Dubuque":{"condition":{"wind_mph":9,"weather_icon_id":130,"pressure_mb":1011,"is_active":true,"wind_kt":8,"station_id":5,"relative_humidity":82,"source":"","temperature_f":77,"temperature_c":25,"current_condition":"Fair","pressure_in":29.91,"visibility_mi":10,"dewpoint_f":71,"dewpoint_c":21,"created_at":"2013-08-28T01:15:09-05:00","updated_at":"2013-08-28T01:15:09-05:00","id":247021,"wind_direction":"West"}},"Prairie du Chien":{"condition":{"wind_mph":0,"weather_icon_id":130,"pressure_mb":null,"is_active":true,"wind_kt":0,"station_id":19,"relative_humidity":90,"source":"","temperature_f":76,"temperature_c":24,"current_condition":"Fair","pressure_in":29.87,"visibility_mi":10,"dewpoint_f":73,"dewpoint_c":22,"created_at":"2013-08-28T01:15:10-05:00","updated_at":"2013-08-28T01:15:10-05:00","id":247035,"wind_direction":"North"}},"Charles City":{"condition":{"wind_mph":0,"weather_icon_id":130,"pressure_mb":null,"is_active":true,"wind_kt":0,"station_id":18,"relative_humidity":89,"source":"","temperature_f":77,"temperature_c":25,"current_condition":"Fair","pressure_in":29.93,"visibility_mi":10,"dewpoint_f":73,"dewpoint_c":23,"created_at":"2013-08-28T01:15:10-05:00","updated_at":"2013-08-28T01:15:10-05:00","id":247034,"wind_direction":"North"}},"Decorah":{"condition":{"wind_mph":0,"weather_icon_id":130,"pressure_mb":null,"is_active":true,"wind_kt":0,"station_id":3,"relative_humidity":89,"source":"","temperature_f":77,"temperature_c":25,"current_condition":"A Few Clouds","pressure_in":29.91,"visibility_mi":10,"dewpoint_f":73,"dewpoint_c":23,"created_at":"2013-08-28T01:15:09-05:00","updated_at":"2013-08-28T01:15:09-05:00","id":247019,"wind_direction":"North"}}};

(function($) {

    document.write("<div style='clear:both;'></div>");

    document.write('<div class="date-weather"></div>');
}
        )(jQuery);

var headerConditionsBuilder = new SmgHeaderConditionsBuilder(jQuery, conditions);
var headerConditionsCookie = headerConditionsBuilder.readWeatherCookie();

if (headerConditionsCookie == null || headerConditionsCookie == "") {
    headerConditionsBuilder.setWeatherCookie("Cedar Rapids");
    headerConditionsCookie = headerConditionsBuilder.readWeatherCookie();
}

headerConditionsBuilder.buildHeaderConditions("Cedar Rapids");
