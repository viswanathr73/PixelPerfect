module.exports = function(grunt) {
  grunt.initConfig({
    clean: {
      build: {
        src: ["lib", ".cache", "tests.js.map", "tests.js"]
      }
    },
    copy: {
      main: {
        files: [
          {
            expand: true,
            cwd: 'src/',
            src: ['**/*.js'],
            dest: 'lib/'
          }
        ]
      }
    },
    newer: {
      options: {
        cache: '.cache'
      }
    },
    coffee: {
      options: {
        sourceMap: true
      },
      all: {
        src: ['**/*.coffee.md', '**/*.coffee'],
        dest: 'lib',
        cwd: 'src',
        expand: true,
        ext: '.js'
      }
    },
    mochaTest: {
      test: {
        options: {
          ui: 'bdd',
          quiet: false,
          require: 'coffee-script/register',
          reporter: 'dot',
          check: ['src/**/*.coffee', 'test/**/*.js', 'test/**/*.coffee']
        },
        src: ['test/**/*.coffee', 'test/**/*.js']
      }
    },
    watch: {
      options: {
        nospawn: true
      },
      all: {
        files: ['Gruntfile.js', 'tasks/*.coffee', 'src/**/*.coffee', 'src/**/*.coffee.md', 'src/**/*.nools', 'src/**/*.js', 'test/*.coffee']
      }
    }
  });
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-newer');
  grunt.registerTask('build', ['newer:coffee', 'newer:copy']);
  grunt.registerTask('rebuild', ['clean', 'build']);
  grunt.registerTask('test', ['build', 'mochaTest']);
  grunt.registerTask('watch', ['watch']);
  return grunt.registerTask('default', ['test']);
};
