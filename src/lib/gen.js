import {
  fmtQuestion
, fmtIndex
, fmtError
, fmtName
} from './format'
import cta from './clithenask'
import act from './act'
import help from './help'
import allhelp from './allhelp'
import log from './logger'

const rungen = async function (generator, argv) {
  const {
    name
  , input
  , actions
  } = generator;

  log(`running generator ${fmtName(name)}`);

  log.debug(generator);
  log.debug(argv);
  const env = await cta(input, argv);

  const r = await act(actions, env);

  log('done!');

  return r;
};

const run = async function (config) {
  const {
    argv
  , generators = []
  , formatName = fmtName
  } = config;

  const [name, ...rest] = argv._;
  if ( ! name ) {
    log.error('no generator selected');
    log('possible generators are:');
    generators.forEach(gen => log.item(gen.name))
    process.exit(1)
  } else if ( name === 'help' ) {
    if ( rest[0] ) {
      const generator = generators.find(gen => gen.name === rest[0]);
      console.log(help(generator));
    } else {
      console.log(allhelp(config));
    }
  } else {
    const generator = generators.find(gen => gen.name === name);
    if ( !generator ) {
      throw new Error(`generator with name ${formatName(name)} does not exist`);
    } else {
      return rungen(generator, {...argv, _: rest }, log);
    }
  }
};

export default async function (config, log) {
  try {
    await run(config)
    process.exit(0);
  } catch (err) {
    log.error(err.message);
    log.debug(err.stack);
    process.exit(1);
  }
};
