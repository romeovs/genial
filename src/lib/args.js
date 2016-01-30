import yargs    from 'yargs'
import unparse  from 'unparse-args'
import {
  fmtError
, fmtName
} from './format'

const parse = function (type, validate, value) {
  if ( type.multiple ) {
    const aval = value instanceof Array ? value : [value];
    return aval.map(function (el) {
      return parse({...type, multiple: false}, validate, el);
    });
  } else if ( type.fn === Boolean ) {
    if ( value.constructor === Boolean ) {
      return value;
    } else {
      return type.parse(value);
    }
  } else {
    const parsed = type.parse(value);
    type.validate(parsed);
    validate(parsed);
    return parsed;
  };
};


const reparse = function (defns, argv, require) {
  const parser = yargs.reset();

  defns.forEach(function (defn) {
    const {
      name
    , type
    , default: def
    , aliases    = []
    , description
    // , validate   = () => true
    , positional = false
    } = defn;

    parser.describe(name, description);

    // set default
    if ( def ) {
      parser.default(name, def);
    }

    // set aliases
    aliases.forEach(function (alias) {
      parser.alias(name, alias);
    });

    // set bool args
    if ( type.fn === Boolean ) {
      parser.boolean(name);
    }

    if ( type.required && require ) {
      parser.require(name);
    }
  });

  // reparse the remaining args
  return parser.parse(unparse(argv));
};

const parseopts = function (defns = [], argv, opts = {}) {
  const {
    ignoreMissing = false
  , noUnknown     = true
  , formatName    = fmtName
  } = opts;

  const args = reparse(defns, argv, !ignoreMissing);
  console.log(args);

  const res = defns.reduce(function (acc, defn) {
    const {
      name
    , type
    , validate   = () => true
    , positional = false
    , default: def
    } = defn;

    let value = args[name];
    console.log(name, value);

    if ( positional ) {
      if ( value && args._.length > 0 ) {
        throw new Error (`you gave ${formatName(name)} twice, once via option and once via positional argument`);
      } else {
        if ( type.multiple || args._.length > 1) {
          value = args._;
        } else {
          value = value || args._[0];
        }
      }
    }

    if ( !type.multiple && value instanceof Array ) {
      throw new Error(`multiple values given for ${formatName(name)}.`);
    }

    const parsed = parse(type, validate, value);
    console.log(name, value, parsed);

    return {
      ...acc
    , [name]: parsed
    };
  }, {});

  return res;
};


export default function (defns, argv, opts = {}) {
  const {
    formatError = fmtError
  } = opts;
  try {
    return parseopts(defns, argv, opts);
  } catch (err) {
    console.log(formatError(err));
    process.exit(1);
  }
};
