import types   from './types'
import actions from './actions'

export default class Generator {
  constructor (name) {
    this.name    = name;
    this.input   = [];
    this.actions = [];
  }

  action (type, c) {
    this.actions = [...this.actions, {
      ...c
    , type
    }];
    return this;
  }

  parameter (name, c) {
    this.input = [...this.input, {
      ...c
    , name
    }];
    return this;
  };
};

const generator = function (name) {
  return new Generator(name);
};

generator.actions = actions;
generator.types   = types;

export default generator;
