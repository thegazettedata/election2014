'use strict';

module.exports = function (grunt) {
    // Load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // Our parameters, which are set when grunt command is ran

    // Map, cleanslate, etc.
    var template = grunt.option('template');
    // Name of project folder
    var folder = grunt.option('folder');
    // GA, KC, HO
    var site = grunt.option('site');

    // Initialize grunt
    grunt.initConfig({
        dirs: {
            output: 'build'
        },
        // Copy files
        copy: {
            // Copy our base files
            base: {
                files: [
                    // Copy JSON directory
                    {
                        expand: true,
                        flatten: true,
                        src: 'json/*.json',
                        dest: 'projects/' + folder + '/json'
                    },
                    // Copy JS files
                    {
                        expand: true,
                        flatten: true,
                        src: 'js/*.js',
                        dest: 'projects/' + folder + '/js'
                    },
                    // Copy CSS files
                    {
                        expand: true,
                        flatten: true,
                        src: 'css/*.css',
                        dest: 'projects/' + folder + '/css'
                    }
                ]
            },
            // Copy our map files
            map: {
                files: [
                    // Copy JSON file
                    {
                        expand: true,
                        flatten: true,
                        src: 'json/map/*.json',
                        dest: 'projects/' + folder + '/json/map'
                    },
                    // Copy JS files
                    {
                        expand: true,
                        flatten: true,
                        src: 'js/map/*.js',
                        dest: 'projects/' + folder + '/js/map'
                    },
                    // Copy CSS files
                    {
                        expand: true,
                        flatten: true,
                        src: 'css/map/*.css',
                        dest: 'projects/' + folder + '/css/map'
                    }
                ]
            },
            // Copy our cleanslate files
            cleanslate: {
                files: [
                    // Copy JS
                    {
                        expand: true,
                        flatten: true,
                        src: 'js/cleanslate/*.js',
                        dest: 'projects/' + folder + '/js/cleanslate'
                    }
                ]
            },
            // Copy our datatable files
            datatable: {
                files: [
                    // Copy JS
                    {
                        expand: true,
                        flatten: true,
                        src: 'js/datatable/*.js',
                        dest: 'projects/' + folder + '/js/datatable'
                    },
                    // Copy CSS files
                    {
                        expand: true,
                        flatten: true,
                        src: 'css/datatable/*.css',
                        dest: 'projects/' + folder + '/css/datatable'
                    }
                ]
            },
            // Copy pbo files
            pbo: {
                src: '../../Templates/macros/data_templates/' + template + '/index.pbo',
                dest: '../../Templates/macros/data_templates/projects/' + folder + '/index.pbo',
                options: {
                    process: function (content, srcpath) {
                        return content.replace('<%?@project_folder=".."%>','<%?@project_folder="' + folder + '"%>');
                    }
                }
            }
        // Close copy
        },
        // Our shell commands
        shell: {
            // This syncs the Includes/data folder
            // It excludes the projects folder
            rsyncIncludes: {
                command: function (branch) {
                    return [
                        'current_branch=$(pwd | sed "s/.*branches//" | cut -d"/" -f2)',
                        'current_site=$(pwd | sed "s/.*branches//" | cut -d"/" -f3)',
                        'rsync -r -v -p --exclude "projects" ~/CDR/Templates/branches/"$current_branch"/"$current_site"/Includes/data ~/CDR/Templates/branches/' + branch + '/' + site + '/Includes/'
                    ].join('&&')
                }
            },

            // This syncs the Templates/macros/data_templates folder
            // It excludes the projects folder
            rsyncTemplates: {
                command: function (branch) {
                    return [
                        'current_branch=$(pwd | sed "s/.*branches//" | cut -d"/" -f2)',
                        'current_site=$(pwd | sed "s/.*branches//" | cut -d"/" -f3)',
                        'rsync -r -v -p --exclude "projects" ~/CDR/Templates/branches/"$current_branch"/"$current_site"/Templates/macros/data_templates ~/CDR/Templates/branches/' + branch + '/' + site + '/Templates/macros/'
                     ].join('&&')
                }
            },
             // This syncs the projects folder set by user
            // In the Includes/data folder
            rsyncIncludesProject: {
                command: function (branch) {
                    return [
                        'current_branch=$(pwd | sed "s/.*branches//" | cut -d"/" -f2)',
                        'current_site=$(pwd | sed "s/.*branches//" | cut -d"/" -f3)',
                        'rsync -r -v -p ~/CDR/Templates/branches/"$current_branch"/"$current_site"/Includes/data/projects/' + folder + ' ~/CDR/Templates/branches/' + branch + '/' + site + '/Includes/data/projects/'
                     ].join('&&')
                }
            },
            // Sync everything in the Includes/data/projects folder
            rsyncIncludesAll: {
                command: function (branch) {
                    return [
                        'current_branch=$(pwd | sed "s/.*branches//" | cut -d"/" -f2)',
                        'current_site=$(pwd | sed "s/.*branches//" | cut -d"/" -f3)',
                        'rsync -r -v -p ~/CDR/Templates/branches/"$current_branch"/"$current_site"/Includes/data/projects/ ~/CDR/Templates/branches/' + branch + '/' + site + '/Includes/data/projects'
                     ].join('&&')
                }
            },
            // This syncs the projects folder set by user
            // In the Templates/macros/data_templates folder
            rsyncTemplatesProject: {
                command: function (branch) {
                    return [
                        'current_branch=$(pwd | sed "s/.*branches//" | cut -d"/" -f2)',
                        'current_site=$(pwd | sed "s/.*branches//" | cut -d"/" -f3)',
                        'rsync -r -v -p ~/CDR/Templates/branches/"$current_branch"/"$current_site"/Templates/macros/data_templates/projects/' + folder + ' ~/CDR/Templates/branches/' + branch + '/' + site + '/Templates/macros/data_templates/projects/'
                     ].join('&&')
                }
            },
            // Sync everything in the Templates/macros/data_templates folder
            rsyncTemplatesAll: {
                command: function (branch) {
                    return [
                        'current_branch=$(pwd | sed "s/.*branches//" | cut -d"/" -f2)',
                        'current_site=$(pwd | sed "s/.*branches//" | cut -d"/" -f3)',
                        'rsync -r -v -p ~/CDR/Templates/branches/"$current_branch"/"$current_site"/Templates/macros/data_templates/projects/ ~/CDR/Templates/branches/' + branch + '/' + site + '/Templates/macros/data_templates/projects'
                     ].join('&&')
                }
            },
            // cd into new branch
            cd: {
                command: function (branch) {
                    return 'cd ~/CDR/Templates/branches/' + branch + '/' + site + '/'
                }
            },
            // cd into new branch and commit our changes
            commit: {
                command: function (branch) {
                    return [
                        'cd ~/CDR/Templates/branches/' + branch + '/' + site + '/',
                        'svn update',
                        'svn --force add .',
                        'svn status',
                        'svn commit -m "Sync to <%= branch %> in ' + site + '"'
                    ].join('&&')
                }
            }
        }
    });

    // Create empty files
    grunt.registerTask('emptyFiles', 'Creates empty files', function() {
        grunt.file.write('projects/' + folder + '/js/script.js', '');
        grunt.file.write('projects/' + folder + '/css/styles.css', '');
        grunt.file.write('projects/' + folder + '/css/not-ie.css', '');
    });

    // Create new project
    grunt.registerTask('new', [
        'copy:base',
        'copy:' + template,
        'copy:pbo',
        'emptyFiles'
    ]);

    // Copy base templates + project to new branch
    // grunt.option('branch') = branch parameter set on command line
    // Equal to = Dev, Stage, Web
    grunt.registerTask('sync', [
        'shell:rsyncIncludes:' + grunt.option('branch'),
        'shell:rsyncTemplates:' + grunt.option('branch'),
        'shell:rsyncIncludesProject:' + grunt.option('branch'),
        'shell:rsyncTemplatesProject:' + grunt.option('branch'),
        'shell:commit:' + grunt.option('branch')
    ]);

    // Same as the above only skip Includes/data/projects folder
    grunt.registerTask('sync-no-includes-projects', [
        'shell:rsyncIncludes:' + grunt.option('branch'),
        'shell:rsyncTemplates:' + grunt.option('branch'),
        'shell:rsyncTemplatesProject:' + grunt.option('branch'),
        'shell:commit:' + grunt.option('branch')
    ]);

    // Same as the above only skip Templates/macros/data_templates folder
    grunt.registerTask('sync-no-data-templates', [
        'shell:rsyncIncludes:' + grunt.option('branch'),
        'shell:rsyncTemplates:' + grunt.option('branch'),
        'shell:rsyncIncludesProject:' + grunt.option('branch'),
        'shell:commit:' + grunt.option('branch'),
    ]);

    // Same as the above only skips entire Templates folder
    grunt.registerTask('sync-just-includes', [
        'shell:rsyncIncludes:' + grunt.option('branch'),
        'shell:rsyncIncludesProject:' + grunt.option('branch'),
        'shell:commit:' + grunt.option('branch')
    ]);

    // Same as the above only skips entire Includes folder
    grunt.registerTask('sync-just-templates', [
        'shell:rsyncTemplates:' + grunt.option('branch'),
        'shell:rsyncTemplatesProject:' + grunt.option('branch'),
        'shell:commit:' + grunt.option('branch')
    ]);

    // Copy just base templates to new branch. Doesn't go into project folders
    grunt.registerTask('sync-no-project', [
        'shell:rsyncIncludes:' + grunt.option('branch'),
        'shell:rsyncTemplates:' + grunt.option('branch'),
        'shell:commit:' + grunt.option('branch')
    ]);

    // Copy base templates + project from Dev to Stage to Web
    // This does not take a branch parameter
    // But does take a site parameter
    grunt.registerTask('sync-mass', [
        'shell:rsyncIncludes:Stage',
        'shell:rsyncTemplates:Stage',
        'shell:rsyncIncludesProject:Stage',
        'shell:rsyncTemplatesProject:Stage',
        'shell:commit:Stage',
        'shell:cd:Stage',
        'shell:rsyncIncludes:Web',
        'shell:rsyncTemplates:Web',
        'shell:rsyncIncludesProject:Web',
        'shell:rsyncTemplatesProject:Web',
        'shell:commit:Web'
    ]);

    // Same as the above only skip Includes/data/projects folder
    grunt.registerTask('sync-mass-no-includes-projects', [
        'shell:rsyncIncludes:Stage',
        'shell:rsyncTemplates:Stage',
        'shell:rsyncTemplatesProject:Stage',
        'shell:commit:Stage',
        'shell:cd:Stage',
        'shell:rsyncIncludes:Web',
        'shell:rsyncTemplates:Web',
        'shell:rsyncTemplatesProject:Web',
        'shell:commit:Web'
    ]);

    // Same as the above only skip Templates/macros/data_templates folder
    grunt.registerTask('sync-mass-no-data-templates', [
        'shell:rsyncIncludes:Stage',
        'shell:rsyncTemplates:Stage',
        'shell:rsyncIncludesProject:Stage',
        'shell:commit:Stage',
        'shell:cd:Stage',
        'shell:rsyncIncludes:Web',
        'shell:rsyncTemplates:Web',
        'shell:rsyncIncludesProject:Web',
        'shell:commit:Web'
    ]);

    // Copy everything within the data folder
    grunt.registerTask('sync-mass-all', [
        'shell:rsyncIncludes:Stage',
        'shell:rsyncTemplates:Stage',
        'shell:rsyncIncludesAll:Stage',
        'shell:rsyncTemplatesAll:Stage',
        'shell:commit:Stage',
        'shell:cd:Stage',
        'shell:rsyncIncludes:Web',
        'shell:rsyncTemplates:Web',
        'shell:rsyncIncludesAll:Web',
        'shell:rsyncTemplatesAll:Web',
        'shell:commit:Web'
    ]);

    // Commit tasks only
    grunt.registerTask('commit', [
        'shell:commit'
    ]);


};