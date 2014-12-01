## Creating a new data project in Saxo
This will walk you through creating a new data project in Saxo. The following you only need to do once:

Make sure you have Homebrew installed, if you don't already:

	ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"

Install node via Homebrew:	
	
	brew install node

Navigate to the Includes/data directory in GA Dev:
	
	cd /CDR/Templates/branches/Dev/GA/Includes/data

Install npm dependies:
	
	npm install

Make sure Grunt is install correctly:
	
	sudo npm install -g grunt-cli 

-- Note: Dependencies for Grunt are put into package.json. If any new dependencies are put in there, you need to install them by running:
	
	npm install


## Create a new project

To create a new project, type the following:
	
	grunt new --template=map --folder=name_of_folder_here

This command takes two parameters: a template and a directory. The template is equal to one of the pre-made templates (i.e. map ) in Saxo. The directory parameter is the name of the directory your files will be put into. This command will create a directory in Includes/data/projects with the JS, CSS, etc. to run the project It will also create a directory in Templates/macros/data/templates/projects with the pbo file for the project.


## Index.pbo

Index.pbo is in the Templates/macros/data_templates/projects/folder-name-here directory. This is the main file for your project. At the top of the file are a series of global variables that you will need to fill in. They help bring in the right CSS, JS files, help set the metadata, etc. You will also see the JS, CSS libraries used with your project on this pbo.


## Includes/data

This is where the includes are placed. All css files not within a subdirectory will get copied when a new project is created. For example, base.css will get moved over but anything within the lib directory will not. The same goes for the JS directory. Files within the lib directories are used with all projects so DON'T change them or they could mess up previous projects.

If you would like to make a change to one of the base files (base.css, base.js, map-geojson, etc.) and want that change to be reflected on all future projects, make the change to the file in the Includes/data directory. Otherwise, make the changes to the files that were copied to the directory you created.

Files with the projects/folder-name-goes-here directory are unique to the project you create. All changes to these files will only reflect the project you are working on


## Edit UI

A couple things need to be done in the Edit UI to get the project online. First, log into the edit UI:
http://zzedit.cdr.dc.publicus.com/apps/pbcsedit.dll/red

Then go to Admin > Taxonomy. Navigate to Placement > Gazette OR KCRG > Data > New item. Then enter the name of your project into the "Word" field and click Save. 

Then go to Admin > Profiles. Then go to Placement > Gazette OR KCRG > Data > New item. Then add the following for the project:
- Name
- URL starting with /data
- Category of Data
- Definition and Default taxonomy words of whatever you entered in for Taxonomy
- Navigation Site Code of GA or KC.

Then go to the Edit UI for either The Gazette:
http://gaedit.cdr.dc.publicus.com/apps/pbcsedit.dll/red
Or KCRG:
http://kcedit.cdr.dc.publicus.com/apps/pbcsedit.dll/red

Then go to Admin > Profiles and find the page you just created. Then set the SEO label to the URL you set or another URL if you want.

## Add re-direct

Now you will need to add a redirect to the data index page. First copy the ID number for your project in the Edit UI. Then go into Templates > macros > data_templates > data_index.pbo and add a profile ID if statement to the page you created. You'll see other if statements at the top of the page, which redirect the /data URLs to the appropriate pbos.


## Dev > Stage > Web

When you are done coding your project, you'll need to add it to Stage and then Web. You can do this easily with a grunt command:

	grunt sync --branch=name_goes_here --site=name_goes_here --folder=name_goes_here

This command takes these parameters: Branch is: Dev, Stage or Web. Site is: GA, KC or HO. Folder is the name of the folder your project is in.

This command will sync what is in the Includes/data directory and the Templates/macros/data_templates directory to the site directory you have specified. The one exception is the projects folder. The only folder within the projects folder that will be copied over is specified with the folder parameter.

If you don't want to sync anything in the projects folder, you can run this command:

	grunt sync-no-project --branch=name_goes_here --site=name_goes_here

It's the same as the above command only it ignores the projects folder.

You can also just commit using this command:

	grunt commit --branch=name_goes_here --site=name_goes_here

This runs SVN update, adds new files then commits the changes.

Finally, if you want to move your project from Dev to Stage to Web all at once, run:
	
	grunt sync-mass --site=name_goes_here --folder=name_goes_here

There are some other Grunt commands for specific use cases not mentioned in this readme. To view those, open up the Gruntfile.js file.

## Attaching an article

Finally, you need to attach an article to the project to get it to properly show up on our /data index page: http://thegazette.com/data.

To do this, go into the Edit UI for either site, create an article with Publication date of "20000101" (under Properties) and set the Taxonomy (under Keywords) to whatever you set. Now go to Edit and set the following:
- Title
- Net title
- Summary
- Byline
- External link > This is the URL of the project itself. Start it with /data
- Embed code 1 > Not required. If you have a related story to go with the interactive, enter it here.

Finally, add a photo with the interactive by going to Pictures > New Image. Set the Type to Main.