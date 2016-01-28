
const actions = {
  add (c) {
    return {
      ...c
    , type: 'add'
    }
  }
};

Object.keys(actions).forEach(function (key) {
  actions[key].type = key;
});

export default actions;
