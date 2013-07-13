module.exports = function(grunt) {

    'use strict';

    var NAME = 'Monobrow';
    var DESCRIPTION = 'Monobrow';
    var URL = 'https://github.com/mcgaryes/monobrow';
    var VERSION = '0.4.0';
    var BANNER = '/**\n * ' + NAME + ' v' + VERSION + '\n * ' + DESCRIPTION + '\n * ' + URL + '\n */\n';

    // config
    grunt.initConfig({
        jshint: {
            files: ['grunt.js', '../src/*.js'],
            options: {
                jshintrc: '../.jshintrc'
            }
        },
        yuidoc: {
            all: {
                name: NAME,
                description: DESCRIPTION,
                version: VERSION,
                url: URL,
                options: {
                    paths: '../src/',
                    outdir: '../docs/'
                }
            }
        },
        jasmine_node: {
            all:{
                specFolders:"../tests/specs"
            }
        }
    });

    // load npm tasks
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jasmine-node');

    // tasks
    grunt.registerTask("default", ["jshint", "jasmine_node"]);
    grunt.registerTask("release", ["default", "yuidoc"]);
};