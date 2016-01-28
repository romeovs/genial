import askMany from './ask'
import args    from './args'

export default async function (defns, argv, opts = {}) {
  opts.ignoreMissing = true;
  const fromCLI = args(defns, argv, opts);
  return askMany(defns, fromCLI, opts);
};
