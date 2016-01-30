import types   from './types'
import actions from './actions'

class Generator {
  constructor (name) {
    this.name    = name;
    this.input   = [];
    this.actions = [];
  }

  description (lines) {
    this.desc = lines;
    return this;
  }

  parameter (name, c) {
    this.input = [...this.input, {
      ...c
    , name
    }];
    return this;
  };

  action (fn) {
    this.actions = [...this.actions, fn];
    return this;
  }
};

const generator = function (name) {
  return new Generator(name);
};

export {
  actions
, types
, generator
};
