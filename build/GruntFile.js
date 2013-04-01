module.exports = function(grunt) {

    'use strict';

    var URL = 'https://github.com/mcgaryes/monobrow';
    var LOGO = "../artwork/logo.png";

    var SERVER_NAME = 'monobrow';
    var SERVER_VERSION = '0.1.0';
    var SERVER_DESCRIPTION = "NodeJS socket server wrapper.";
    var SERVER_PACKAGE = {
        "name": SERVER_NAME,
        "version": SERVER_VERSION,
        "description": SERVER_DESCRIPTION,
        "keywords": ["socket", "tcp", "server", "realtime", "net"],
        "homepage": URL,
        "bugs": {
            "url": URL + "/issues"
        },
        "main": SERVER_NAME,
        "repository": {
            "type": "git",
            "url": URL
        },
        "licenses": [{
            "type": "MIT",
            "url": URL + "/master/LICENSE"
        }],
        "dependecies": {
            "underscore": "1.x.x",
            "backbone": "1.x.x",
            "ansi-color": "0.2.1"
        }
    };

    var CLIENT_NAME = "monobrow-client";
    var CLIENT_VERSION = '0.1.0';
    var CLIENT_DESCRIPTION = "Monobrow node socket client.";
    var CLIENT_PACKAGE = {
        "name": CLIENT_NAME,
        "version": CLIENT_VERSION,
        "description": CLIENT_DESCRIPTION,
        "keywords": ["socket", "tcp", "server", "realtime", "net"],
        "homepage": URL,
        "bugs": {
            "url": URL + "/issues"
        },
        "main": CLIENT_NAME,
        "repository": {
            "type": "git",
            "url": URL
        },
        "licenses": [{
            "type": "MIT",
            "url": URL + "/master/LICENSE"
        }],
        "dependecies": {
            "underscore": "1.x.x",
            "backbone": "1.x.x",
            "ansi-color": "0.2.1"
        }
    };

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
            client: {
                name: CLIENT_NAME,
                description: CLIENT_DESCRIPTION,
                version: CLIENT_VERSION,
                url: URL,
                options: {
                    paths: '../source/',
                    exclude:'monobrow.server.core.js,monobrow.server.js',
                    outdir: '../clients/node/docs/'
                }
            },
            server: {
                name: SERVER_NAME,
                description: SERVER_DESCRIPTION,
                version: SERVER_VERSION,
                url: URL,
                options: {
                    paths: '../source/',
                    exclude:'monobrow.client.core.js,monobrow.client.js',
                    outdir: '../docs/'
                }
            }
        },
        jshint: {
            options: {
                jshintrc: '../.jshintrc'
            },
            server: ['grunt.js', '../' + SERVER_NAME + '.js'],
            client: ['grunt.js', '../clients/node/' + CLIENT_NAME + '.js']
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
                dest: '../' + SERVER_NAME + '.js'
            },
            client: {
                src: [
                    '../source/monobrow.intro.js',
                    '../source/monobrow.client.core.js',
                    '../source/monobrow.logger.js',
                    '../source/monobrow.client.js',
                    '../source/monobrow.outro.js'],
                dest: '../clients/node/' + CLIENT_NAME + '.js'
            },
        },
        jsbeautifier: {
            options: {
                'indent_size': 4,
                "max_preserve_newlines": 1,
            },
            files: ['../' + SERVER_NAME + '.js', '../clients/node/' + CLIENT_NAME + '.js']
        },
        copy: {
            server: {
                options: {
                    processContent: function() {
                        return JSON.stringify(SERVER_PACKAGE);
                    }
                },
                files: {
                    "../package.json": "../package.json"
                }
            },
            client: {
                options: {
                    processContent: function() {
                        return JSON.stringify(CLIENT_PACKAGE);
                    }
                },
                files: {
                    "../clients/node/package.json": "../clients/node/package.json"
                }
            }
        }
    });

    // load npm tasks
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-jsbeautifier');

    // tasks
    grunt.registerTask('client', ['concat:client', 'jsbeautifier', 'jshint:client', 'copy:client', 'yuidoc:client']);
    grunt.registerTask('server', ['concat:server', 'jsbeautifier', 'jshint:server', 'copy:server', 'yuidoc:server']);

};