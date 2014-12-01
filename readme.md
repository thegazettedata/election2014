#Election 2014 app

[LIVE](http://www.kcrg.com/elections)

This is the code that runs our Election 2014 app. It uses a host of Javascript libraries to run, including Backbone, jQuery UI, Leaflet, DataTables, Underscore and more.

On election night, the page was automatically updated every five minutes. Results from the AP were imported into Newsticker, which spit out an XML feed every five minutes. We then wrote a Ruby parser that converted that into JSON. A cron job ran that parser every two minutes. Finally, that JSON file is reloaded on the page every five minutes.




