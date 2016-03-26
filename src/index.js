#!/usr/bin/env node
import Liftoff   from 'liftoff'
import interpret from 'interpret'
import yargs     from 'yargs'
import v8flags   from 'v8flags'

import pkg       from '../package.json'
import log       from './lib/logger'
import gen       from './lib/gen'

const argv = yargs
  .boolean(['help', 'version', 'verbose'])
  .alias('version', 'v')
  .alias('verbose', 'V')
  .argv;

log.configure({
  verbose:  argv.verbose
, colors:  !argv.nocolors
})

log.debug('verbose mode enabled');

const Gen = new Liftoff({
  name: 'gen'
, moduleName: 'genial'
, configName: 'genfile'
, extensions: interpret.jsVariants
, v8flags:    v8flags
})
  .on('require', function (name) {
    log.debug(`requiring '${name}'`);
  })
  .on('requireFail', function (name, err) {
    log.error(err.message);
  })

const run = function (env) {
  log.debug('GLOBAL VERSION =', pkg.version);
  log.debug('LOCAL  VERSION =', env.modulePackage.version);
  log.debug('CWD =', env.cwd);
  log.debug('GENFILE =', env.configPath);

  // error if not genfile is found
  if ( !env.configPath ) {
    log.error('no genfile found');
    process.exit(1);
  }

  // warn if versions differ
  if ( pkg.version !== env.modulePackage.version ) {
    log.warn(`warning: versions differ.`);
    log.warn(`  local  version is: ${env.modulePackage.version}`)
    log.warn(`  global version is: ${pkg.version}`);
  }

  // if version is asked, jsut show and quit
  if ( argv.version ) {
    console.log(pkg.version);
    process.exit(0);
  }

  // require the configuration
  require('babel-register');
  const required = require(env.configPath);
  const config   = required.default ? required.default : required;


  // remove superflous (liftoff/node specific) argv keys
  delete argv.require;
  delete argv.genfile;
  delete argv.verbose;
  delete argv.V;
  delete argv.version;
  delete argv.v;
  delete argv.cwd;
  delete argv.completion;
  delete argv['$0'];

  const opts = {
    generators: config.generators
  , argv
  };

  log.debug(opts);

  // run the generators
  gen(opts, log);
};


Gen.launch({
  cwd:        argv.cwd
, configPath: argv.genfile
, verbose:    argv.verbose
, completion: argv.completion
, require:    argv.require    // optionally require hooks
}, run)
