import actions    from './actions'
import handlebars from 'handlebars'
import ccase      from 'change-case'
import fs         from 'mz/fs'
import mkdirp     from 'mkdirp'
import path       from 'path'
import colors     from 'colors'
import log        from './logger'

const mkdir = function (dirname) {
  return new Promise(function (resolve, reject) {
    mkdirp(dirname, {}, function (err, res) {
      if ( err ) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

[
  'upper'
, 'lower'
, 'title'
, 'camel'
, 'pascal'
, 'snake'
, 'param'
, 'dot'
, 'constant'
].forEach(function (name) {
  const key = `${name}Case`;
  handlebars.registerHelper(key, ccase[key]);
});

// alias dashCase
handlebars.registerHelper('dashCase', ccase.paramCase);

const compiler = function (data) {
  return function (str) {
    return handlebars.compile(str)(data);
  };
};

const add = async function (action, env) {
  const {
    from
  , to
  } = action;

  const expand = compiler(env);

  const template = expand(from);
  const dest     = expand(to);

  if ( ! await fs.exists(path.resolve(template)) ) {
    throw new Error(`template file ${template} does not seem to exist`);
  }

  const tmpl = await fs.readFile(path.resolve(template));
  const content = expand(tmpl.toString());

  if ( await fs.exists(dest) ) {
    log.warn(`${dest} already exists, skipping.`)
  } else {
    log(`creating ${colors.magenta(dest)}`);
    await mkdir(path.dirname(dest));
    await fs.writeFile(dest, content);
  }
};

const act = function (action, env) {
  switch (action.type) {
    case actions.add.type: return add(action, env);
    default:
      throw new Error(`Unknown action type: ${action.type.name}`);
  }
};

export default async function (actionfns, env) {

  const actions = await actionfns.reduce(async function (acc, fn) {
    const actions = await fn(env);
    if ( actions === undefined ) {
      return acc;
    }

    if ( actions instanceof Array ) {
      const f = actions.filter(function (el) {
        if ( el && !el.type ) {
          throw new Error(`invalid action ${action}`);
        }
        return el !== undefined;
      });
      return [...acc, ...f];
    } else if ( actions instanceof Object ) {
      if ( !actions.type ) {
        throw new Error(`invalid action ${action}`);
      }

      return [...acc, actions];
    } else {
      throw new Error(`invalid action ${action}`);
    }
  }, []);

  const doing = actions.map(action => act(action, env));
  const done  = await Promise.all(doing);
};

