'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                preserveComments: 'some'
            },
            build: {
                src: './out/connect-rtc.js',
                dest: './out/connect-rtc.min.js'
            }
        },
        browserify: {
            connectRtcGlobalObjectDebug: {
                src: [
                    './lib/dcv-webrtc-redir-client-bundle.js',
                    './src/js/connect-rtc.js'
                ],
                dest: './out/connect-rtc-debug.js',
                options: {
                    browserifyOptions: {
                        debug: true
                    },
                    transform: [["babelify", { "presets": ["env"] }]],
                }
            },
            connectRtcGlobalObject: {
                src: [
                    './lib/dcv-webrtc-redir-client-bundle.js',
                    './src/js/connect-rtc.js'
                ],
                dest: './out/connect-rtc.js',
                options: {
                    transform: [["babelify", { "presets": ["env"] }]],
                }
            }
        },
        watch: {
            files: ['src/**/*.js', 'test/**/*.js'],
            tasks: ['browserify']
        },
        githooks: {
            all: {
                'pre-commit': 'lint'
            }
        },
        eslint: {
            options: {
                configFile: '.eslintrc'
            },
            target: ['src/**/*.js', 'test/*.js', 'test/unit/*.js']
        },
        copy: {
            build: {
                dest: 'release/',
                cwd: 'out',
                src: '**',
                nonull: true,
                expand: true
            }
        },
        connect: {
            server: {
                options: {
                    port: 9943,
                    protocol: 'https'
                }
            }
        },
        replace: {
            dist: {
              options: {
                patterns: [
                  {
                    match: 'RTC_JS_VERSION',
                    replacement: '<%= pkg.version %>'
                  }
                ]
              },
              files: [
                {
                  expand: true, flatten: true, src: ['out/*.js'], dest: 'out/'
                }
              ]
            }
          }
    });

    grunt.loadNpmTasks('grunt-githooks');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-replace');
    grunt.registerTask('default', ['eslint', 'browserify', 'replace', 'uglify']);
    grunt.registerTask('lint', ['eslint']);
    grunt.registerTask('build', ['browserify', 'replace', 'uglify']);
    grunt.registerTask('copyForPublish', ['copy']);
    grunt.registerTask('demo', ['build', 'connect', 'watch']);
};
