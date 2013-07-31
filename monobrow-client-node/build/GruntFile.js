module.exports = function(grunt) {

    'use strict';

    var NAME = 'Monobrow-Node-Client';
    var DESCRIPTION = 'Monobrow-Node-Client';
    var URL = 'https://github.com/mcgaryes/monobrow';
    var VERSION = '0.8.1';
    var BANNER = '/**\n * ' + NAME + ' v' + VERSION + '\n * ' + DESCRIPTION + '\n * ' + URL + '\n */\n';

    // config
    grunt.initConfig({
        jshint: {
            files: ['grunt.js', '../src/*.js'],
            options: {
                jshintrc: '../.jshintrc'
            }
        },
        jasmine: {
            all: {
                options: {
                    specs: '../tests/specs/*.js',
                    template: '../tests/custom.tmpl'
                }
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
        }
    });

    // load npm tasks
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-jasmine');


    // tasks
    grunt.registerTask('default', ['jshint', /*'jasmine',*/ "yuidoc"]);
};