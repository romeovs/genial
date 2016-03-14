import colors from 'colors/safe'

const id = x => x;
export default function (verbose = false, usecolors = true) {

  const blue   = usecolors ? colors.blue : id;
  const grey   = usecolors ? colors.grey : id;
  const yellow = usecolors ? colors.yellow : id;
  const red    = usecolors ? colors.red : id;

  const log = function (...args) {
    const [msg, ...rest] = args;
    console.log(grey('gen: '), msg, ...rest);
  };

  if ( verbose ) {
    log.debug = function (...args) {
      const [msg, ...rest] = args;
      console.log(blue('gen: '), msg, ...rest);
    };
  } else {
    log.debug = () => undefined;
  }

  log.warn = function (...args) {
    const [msg, ...rest] = args;
    console.log(grey('gen: '), yellow(msg), ...rest);
  };

  log.error = function (...args) {
    const [msg, ...rest] = args;
    console.error(grey('gen: '), red(`Ooops! ${msg}`), ...rest);
  };

  log.item = function (item) {
    log(yellow('  -'), item)
  };

  return log;
};

