import actions    from './actions'
import handlebars from 'handlebars'
import ccase      from 'change-case'
import fs         from 'mz/fs'
import mkdirp     from 'mkdirp'
import path       from 'path'

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

const add = async function (action, env, log) {
  const {
    from
  , to
  } = action;

  const expand = compiler(env);

  const template = expand(from);
  const dest     = expand(to);

  const tmpl = await fs.readFile(path.resolve(template));
  const content = expand(tmpl.toString());

  if ( await fs.exists(dest) ) {
    log.warn(`${dest} already exists, skipping.`)
  } else {
    log(`creating ${dest}`);
    await mkdir(path.dirname(dest));
    await fs.writeFile(dest, content);
  }
};

const act = function (action, env, log) {
  switch (action.type.name) {
    case actions.add.name: return add(action, env, log);
    default:
      throw new Error(`Unknown action type: ${action.type.name}`);
  }
};

export default async function (actions, env, log) {
  const doing = actions.map(action => act(action, env, log));
  const done  = await Promise.all(doing);
};
