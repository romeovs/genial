import validator from 'validator'

const truthy   = /^(y|yes|Y|true|ok|nice|yep|YES|ye|ay|aye|aye!|da|yup|yep)$/;
const falsy    = /^(n|no|N|false|no way|bugger off|nay|njet|NO|paz+t)$/;
const integer  = validator.isInt;
const floating = validator.isFloat;

const types = {
  // STRING
  string: {
    name:      'string'
  , fn:        String
  , parse:     (x => x)
  , multiple:  false
  , required:  false
  }

  // BOOLEAN
, bool: {
    name:      'bool'
  , fn:        Boolean
  , parse (str) {
      if ( truthy.test(str) ) {
        return true;
      } else if ( falsy.test(str) ) {
        return false;
      } else {
        throw new Error('expecting `yes` or `no`');
      }
    }
  , multiple:  false
  , required:  true
  }

  // NUMBER
, number: {
    name:   'number'
  , fn:     Number
  , parse (str, opts) {
      if(str && floating(str)) {
        return Number(str);
      } else {
        throw new Error(`invalid number: ${str}`);
      }
    }
  , multiple:  false
  , required:  false
  }

  // INTEGER
, integer: {
    name:   'integer'
  , fn:     Number
  , parse (str) {
      if(str && integer(str)) {
        return Number(str);
      } else {
        throw new Error(`invalid integer: ${str}`);
      }
    }
  , multiple:  false
  , required:  false
  }

  // ARRAY
, array(type) {
    const t = {
      ...type
    , name: `array(${type.name})`
    , multiple: true
    }

    t.require = { ...t, required: true };
    return t;
  }

};

[
  ['email', 'isEmail']
, ['url',   'isURL'  ]
, ['date',  'isDate' ]
, ['ip address', 'isIP']
].forEach(function ([name, key]) {
  types[name] = {
    name
  , fn: String
  , parse(str) { return str; }
  , validate(str) {
      if (!validator[key](str)) {
        throw new Error(`invalid ${name}: ${str}`);
      }
    }
  }
});

Object.keys(types).forEach(function (key) {
  types[key].validate = types[key].validate || (x => x);
});

Object.keys(types).forEach(function (key) {
  types[key].require  = { ...types[key], required: true };
});

export default types;
