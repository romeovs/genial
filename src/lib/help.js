import colors from 'colors'
import strip  from 'strip-ansi'

const showType = function (type) {
  if (type.fn === Boolean ) {
    return ''
  } else {
    return colors.grey(`<${type.name}>`);
  }
};

const showRequired = function (req) {
  return req ? colors.yellow('required') : '';
};

const showPositional = function (pos) {
  return pos ? colors.yellow('positional') : '';
};

const showDefault = function (def) {
  return def ? `(${def})` : ''
};

const showArg = function (defn = {}) {
  const {
    name
  , type
  , default: def
  , description
  , aliases = []
  , positional
  } = defn;

  const names = [name, ...aliases].map(function (n) {
    if ( n.length > 1 ) {
      return `--${n}`
    } else {
      return `-${n}`
    }
  }).join(', ');

  // return `  ${colors.bold(names)} ${showType(type)} ${description} ${showDefault(def)}  ${showRequired(type.required)}`;
  return [`    ${colors.bold(names)} ${showType(type)}`,  `${description} ${showDefault(def)}  ${showRequired(type.required)} ${showPositional(type.positional)}`];
};

const pad = function (str, len = 0) {
  if (strip(str).length < len ) {
    return pad(str + ' ', len);
  } else {
    return str;
  }
};

const tab = function (rows) {
  const maxes = rows.reduce(function (acc, row) {
    const a = row.length >  acc.length ? row.map(x => strip(x).length) : acc;
    const b = row.length <= acc.length ? row.map(x => strip(x).length) : acc;

    return a.map(function (el, i) {
      return Math.max(el, b[i] || 0);
    });
  }, []);

  return rows.map(function (row) {
    return row.map(function (el, i) {
      return pad(el, maxes[i]);
    }).join('  ');
  }).join('\n');
};

const lines = function (lns) {
  if (!lns) {
    return '';
  } else if (lns instanceof Array) {
    return '  ' + lns.join('\n  ');
  } else {
    return lns;
  }
}

export default function (generator) {
  const {
    name
  , input
  , desc
  } = generator;

  const args = tab(input.map(showArg));

  return (
`
${colors.bold(name)}

${lines(desc)}

  ${colors.underline('arguments:')}

${args}
`
);

};
