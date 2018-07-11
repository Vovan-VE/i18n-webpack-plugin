import { basename, join } from 'path';
import webpack from 'webpack';
import I18nYii2ExtractPlugin from '../src';

const casesPath = join(__dirname, 'cases');

export default function processFile(entry, pluginOpts) {
  let resolvedEntry;
  let resolvedOutput;
  let pluginOutput;
  const result = {};

  if (Array.isArray(entry)) {
    resolvedEntry = {};
    resolvedOutput = '[name].tmp.js';
    pluginOutput = '[name].tmp.json';
    const pluginOutputResolved = {};
    result.files = pluginOutputResolved;
    entry.forEach((e) => {
      const eBasename = basename(e, '.code.js');
      const ePluginOutputBase = `${eBasename}.tmp.json`;
      resolvedEntry[eBasename] = join(casesPath, e);
      pluginOutputResolved[ePluginOutputBase] = join(casesPath, ePluginOutputBase);
    });
  } else {
    resolvedEntry = join(casesPath, entry);
    resolvedOutput = `${basename(entry, '.code.js')}.tmp.js`;
    const pluginOutputBasename = `${basename(entry, '.code.js')}.tmp.json`;
    // here use absolute path to unsure it works
    pluginOutput = join(casesPath, pluginOutputBasename);
    result.file = pluginOutput;
  }

  const compiler = webpack({
    mode: 'none',
    entry: resolvedEntry,
    output: {
      filename: resolvedOutput,
      path: casesPath,
      libraryTarget: 'commonjs2',
    },
    plugins: [
      new I18nYii2ExtractPlugin({
        inputFileName: `${basename(pluginOutput, '.tmp.json')}.src.json`,
        ...pluginOpts,
        outputFileName: pluginOutput,
      }),
    ],
  });

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        reject(err);
        return;
      }
      // stats.compilation.errors contains errors and warnings produced by plugin itself
      if (stats.compilation.errors.length) {
        reject(stats.compilation.errors[0]);
        return;
      }

      resolve({
        ...result,
        stats,
      });
    });
  });
}
