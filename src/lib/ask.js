import types  from './types';
import {
  fmtQuestion
, fmtIndex
, fmtError
, fmtName
} from './format'


// takes (foratted) question and resturns on value
const askOnce = function (question) {
  return new Promise(function (resolve, reject) {
    process.stdout.write(question);
    process.stdin.once('data', function (got) {
      const str = got.trim();
      resolve(str);
    }).resume();
  });
};


const prompt = async function (opts, defn) {
  const {
    formatQuestion = fmtQuestion
  , formatIndex    = fmtIndex
  , formatError    = fmtError
  , formatName     = fmtName
  } = opts;

  const {
    name
  , type
  , default: def
  , validate = () => true
  } = defn;

  const parse = function (str) {
    const parsed = type.parse(str);
    type.validate(parsed);
    validate(validate);
    return parsed;
  };

  // return new Promise(function (resolve, reject) {
  process.stdin.setEncoding('utf8');

  if ( !type.multiple ) {
    // single value
    const retry = async function () {
      try {
        let str = await askOnce(formatQuestion(defn));
        if ( str === '' ) {
          // emtpy value
          if ( def ) {
            // use default if possible
            str = def;
          } else if ( type.required ) {
            // throw if no default and required
            throw new Error(`${formatName(name)} cannot be empty`);
          }
        }
        return parse(str);
      } catch (err) {
        console.log(formatError(err));
        return retry();
      }
    };

    return retry();

  } else {
    // array
    const next = async function (buf) {
      let str = await askOnce(formatIndex(buf.length));
      if ( str === '' ) {
        return buf;
      } else {
        try {
          return next(buf.concat(parse(str)));
        } catch (err) {
          console.log(formatError(err));
          return next(buf);
        }
      }
    };

    console.log(formatQuestion(defn));
    return next([]);
  };
};

// ask many questions
const askMany = function (defns, obj = {}, opts = {}) {
  return defns.reduce(async function (acc, defn) {
    const prev = await acc;
    if ( obj[defn.name] === undefined && defn.type.required ) {
      return {
        ...prev
      , [defn.name]: await prompt(opts, defn)
      };
    } else {
      return prev;
    }
  }, obj);
};


export default askMany;
