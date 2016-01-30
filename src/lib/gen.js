import {
  fmtQuestion
, fmtIndex
, fmtError
, fmtName
} from './format'
import cta from './clithenask'
import act from './act'

const rungen = async function (generator, argv, log) {
  const {
    name
  , input
  , actions
  } = generator;

  log(`running generator ${fmtName(name)}`);

  log.debug(generator);
  log.debug(argv);
  const env = await cta(input, argv);

  const r = await act(actions, env, log);

  log('done!');

  return r;
};

const run = async function (config, log) {
  const {
    argv
  , generators
  , formatName = fmtName
  } = config;

  const [name, ...rest] = argv._;
  if ( ! name ) {
    throw new Error('no generator selected');
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
    await run(config, log)
    process.exit(0);
  } catch (err) {
    log.error(err.message);
    log.debug(err.stack);
    process.exit(1);
  }
};
