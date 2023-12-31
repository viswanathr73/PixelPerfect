coffeeCoverage  = require 'coffee-coverage'

projectRoot     = process.cwd()
coverageVar     = coffeeCoverage.findIstanbulVariable()
reporter        = 'coverage/coverage-coffee.json'
writeOnExit     = if not coverageVar? then reporter else null

#instead of --require coffee-coverage/register-istanbul
coffeeCoverage.register
  instrumentor: 'istanbul'
  basePath: projectRoot
  exclude: ['/test', '/node_modules', '/.git', '/Gruntfile.coffee']
  coverageVar: coverageVar
  writeOnExit: writeOnExit
  initAll: if (_ref = process.env.COFFEECOV_INIT_ALL) != null then _ref == 'true' else true
