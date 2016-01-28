import types  from './types';
import {
  fmtQuestion
, fmtIndex
, fmtError
, fmtName
} from './format'

const prompt = function (opts, defn) {
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

  return new Promise(function (resolve, reject) {
    process.stdin.setEncoding('utf8');

    if ( !type.multiple ) {
      // single value
      const retry = function () {
        return new Promise(function (resolve, reject) {
          process.stdout.write(formatQuestion(defn));
          process.stdin.once('data', function(val){
            try {
              const str = val.trim();
              if ( str === '' ) {
                if ( def !== undefined ) {
                  type.validate(def);
                  validate(def);
                  resolve(def)
                } else if ( type.required ) {
                  throw new Error(`${formatName(name)} cannot be empty`);
                } else {
                  const parsed = type.parse(str);
                  type.validate(parsed);
                  validate(parsed);
                  resolve(parsed);
                }
              } else {
                const parsed = type.parse(str);
                type.validate(parsed);
                validate(parsed);
                resolve(parsed);
              }
            } catch (err) {
              console.log(formatError(err));
              return resolve(retry());
            }
          }).resume();
        });
      };
      resolve(retry());
    } else {
      const buf = [];
      console.log(formatQuestion(defn));
      process.stdout.write(formatIndex(buf.length))
      process.stdin.on('data', function(val){
        if ( val === '\n' || val === '\r\n' ) {
          process.stdin.removeAllListeners('data');
          resolve(buf);
        } else {
          const str = val.trim();
          try {
            const parsed = type.parse(str);
            type.validate(parsed);
            validate(parsed);
            buf.push(parsed);
            process.stdout.write(formatIndex(buf.length))
          } catch (err) {
            console.log(formatError(err));
            process.stdout.write(formatIndex(buf.length))
          }
        }
      }).resume();
    }
  });
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
