import minimist from 'minimist'
import {
  fmtError
, fmtName
} from './format'

const defs = minimist(process.argv.slice(2));

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

const parseopts = function (defns = [], argv = defs, opts = {}) {
  const {
    ignoreMissing = false
  , noUnknown     = true
  , formatName    = fmtName
  } = opts;

  const res = defns.reduce(function (acc, defn) {
    const {
      name
    , type
    , aliases    = []
    , validate   = () => true
    , positional = false
    , default: def
    } = defn;

    const names = [name, ...aliases, ...(positional ? ['_'] : [])];

    // find the argument in cli
    const key = names.find(key => argv[key] !== undefined );
    if ( key ) {
      let value = argv[key];

      // makes sure we have correct plurality
      if ( !type.multiple && value instanceof Array ) {
        if ( key === '_' && value.length > 1) {
          throw new Error(`multiple values given for ${formatName(name)}.`);
        } else if ( key === '_' && value.length < 1) {
          if ( ignoreMissing ) {
            return acc;
          } else {
            throw new Error(`no value given for ${formatName(name)}.`);
          }
        } else {
          value = value[0];
        }
      } else if (type.multiple && ! value instanceof Array ) {
        value = [value];
      }

      // makes sure argument is only given in one way (positional or via name)
      if ( positional ) {
        if ( key !== '_' && argv._.length !== 0 ) {
          throw new Error (`you gave ${formatName(name)} twice, once via option and once via positional argument`);
        } else {
          delete argv._;
        }
      }

      // delete all keys that are alias
      names.forEach(n => delete argv[n]);

      const parsed = parse(type, validate, value);

      return {
        ...acc
      , [name]: parsed
      };
    } else {

      let value;
      if ( def !== undefined ) {
        console.log('default', name, def);
        value = def;
      } else if ( type.fn === Boolean ) {
        value = false;
      } else if ( type.required && !ignoreMissing ) {
        throw new Error(`required argument ${formatName(name)} not preset`);
      }

      return {
        ...acc
      , [name]: value
      };
    }
  }, {})

  if ( argv._ && argv._.length === 0 ) {
    delete argv._;
  }

  if ( argv._ && noUnknown ) {
    const option = Object.keys(argv)[0];
    throw new Error(`unknown option: ${option}`);
  };

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
    return false;
  }
};




