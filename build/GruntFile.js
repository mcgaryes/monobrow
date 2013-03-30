module.exports = function(grunt) {

    'use strict';

    var NAME = 'Monobrow';
    var DESCRIPTION = '';
    var URL = 'https://github.com/mcgaryes/monobrow';
    var VERSION = '0.1.0';
    var BANNER = '/**\n * ' + NAME + ' v' + VERSION + '\n * ' + DESCRIPTION + '\n * ' + URL + '\n */\n';
    var LOGO = "../artwork/logo.png";

    // config
    grunt.initConfig({
        jasmine: {
            all: {
                options: {
                    specs: '../tests/specs/*.js',
                    template: '../tests/custom.tmpl'
                }
            }
        },
        yuidoc: {
            project: {
                name: NAME,
                description: DESCRIPTION,
                version: VERSION,
                url: URL,
                logo: LOGO,
                options: {
                    paths: '../source/',
                    outdir: '../docs/'
                }
            }
        },
        jshint: {
            options: {
                jshintrc: '../.jshintrc'
            },
            server:['grunt.js', '../monobrow.server.js'],
            client:['grunt.js', '../clients/node/monobrow.client.js']
        },
        concat: {
            options: {
                separator: '\n'
            },
            server: {
                src: [
                    '../source/monobrow.intro.js',
                    '../source/monobrow.server.core.js',
                    '../source/monobrow.logger.js',
                    '../source/monobrow.manager.js',
                    '../source/monobrow.server.js',
                    '../source/monobrow.outro.js'],
                dest: '../monobrow.server.js'
            },
            client: {
                src: [
                    '../source/monobrow.intro.js',
                    '../source/monobrow.client.core.js',
                    '../source/monobrow.logger.js',
                    '../source/monobrow.client.js',
                    '../source/monobrow.outro.js'],
                dest: '../clients/node/monobrow.client.js'
            },
        },
        jsbeautifier: {
            options: {
                'indent_size': 4,
                "max_preserve_newlines": 1,
            },
            files: ['../monobrow.server.js', '../clients/node/monobrow.client.js']
        }
    });

    // load npm tasks
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-jsbeautifier');

    // tasks
    grunt.registerTask('client', ['concat:client', 'jsbeautifier', 'jshint:client']);
    grunt.registerTask('server', ['concat:server', 'jsbeautifier', 'jshint:server']);

};