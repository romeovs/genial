import colors from 'colors';

export const fmtQuestion = function (defn) {
  const {
    name
  , description = name
  , question = description
  , validate = () => true
  , type
  , default: def
  } = defn;

  let msg = colors.bold(question) + ' ';

  // show default
  if ( type.fn === Boolean ) {
    msg += def == true ? `(Y|n) ` : `(y|N) `;
  } else {
    if ( def !== undefined ) {
      msg += `(${def}) `;
    }
  }

  return msg;
};

export const fmtIndex = function (idx) {
  return colors.gray(idx.toString()) + ' ';
};

export const fmtError = function (err) {
  return colors.red(err.message);
};

export const fmtName = function (name) {
  return `${colors.magenta(name)}`;
};
