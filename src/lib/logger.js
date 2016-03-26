import colors from 'colors/safe'

const id = x => x;

let CONFIG = {
  debug:  false
, colors: true
}

const blue   = x => CONFIG.colors ? colors.blue(x)   : x
const grey   = x => CONFIG.colors ? colors.grey(x)   : x
const yellow = x => CONFIG.colors ? colors.yellow(x) : x
const red    = x => CONFIG.colors ? colors.red(x)    : x

const print = function (...args) {
  console.log(grey('gen:'), ...args)
}

const log = function (...args) {
  print(...args)
};

log.print = print
log.out   = function (a) {
  process.stdout.write(grey('gen: '));
  process.stdout.write(a);
}

log.debug = function (...args) {
  if ( CONFIG.DEBUG ) {
    print(...args.map(blue))
  }
};

log.warn = function (...args) {
  print(...args.map(yellow))
};

log.error = function (...args) {
  print(...args.map(red))
};

log.item = function (item) {
  print(yellow('  -'), item)
};

log.configure = function (conf) {
  CONFIG = {
    ...CONFIG
  , ...conf
  }
};

export default log
