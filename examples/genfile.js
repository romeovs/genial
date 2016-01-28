import {
  generator
, types
, actions
}from 'genial'

const {

const example =
  generator('example')
    .parameter('name', {
      type: types.string.require
    , description: 'your user name'
    , question: 'what is your name?'
    // , default: 'nice'
    , validate (x) {
        if (x === 'milo') {
          throw new Error('\'milo\' is not allowed');
        }
      }
    })
    .parameter('email', {
      description: 'email address'
    , default: 'romeov'
    , type: types.email.require
    , positional: true
    })
    .parameter('foo', {
      type: types.bool
    , aliases: ['f']
    })
    .action(actions.add, {
      from: './templates/foo.txt'
    , to:   './components/{{name}}.txt'
    })

export default [
  example
];
