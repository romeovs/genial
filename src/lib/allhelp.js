import colors from 'colors'

export default function (config) {
  const gens = '  - ' + config.generators.map(x => colors.bold(x.name)).join('\n  - ')

  return (
`generators in this project:

${gens}
`)


};
