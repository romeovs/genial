#!/usr/bin/env node
import Liftoff   from 'liftoff'
import interpret from 'interpret'
import yargs  from 'yargs'
import v8flags   from 'v8flags'

import pkg       from '../package.json'
import logger    from './lib/logger'
import gen       from './lib/gen'

// const argv = minimist(process.argv.slice(2), {
// const argv = minimist(process.argv, {
//   alias: {
//     'help':    'h'
//   , 'version': 'v'
//   , 'verbose': 'V'
//   }
// });

const argv = yargs
  .boolean(['help', 'version', 'verbose'])
  .alias('help', 'h')
  .alias('version', 'v')
  .alias('verbose', 'V')
  .argv;

const log = logger(argv.verbose, argv.color);

log.debug('verbose mode enabled');

const Gen = new Liftoff({
  name: 'gen'
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

  if ( !env.configPath ) {
    log.error('no genfile found');
    process.exit(1);
  }

  // require the configuration
  const required   = require(env.configPath);
  const generators = required.default ? required.default : required;

  if ( pkg.version !== env.modulePackage.version ) {
    log.warn(`warning: versions differ.`);
    log.warn(`  local  version is: ${env.modulePackage.version}`)
    log.warn(`  global version is: ${pkg.version}`);
  }

  if ( argv.help ) {
    // todo show help
    console.log('help');
    process.exit(0);
  }

  if ( argv.version ) {
    console.log(pkg.version);
    process.exit(0);
  }

  delete argv.require;
  delete argv.genfile;
  delete argv.verbose;
  delete argv.V;
  delete argv.version;
  delete argv.v;
  delete argv.help;
  delete argv.h;
  delete argv.cwd;
  delete argv.completion;
  delete argv['$0'];

  const opts = {
    generators
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
