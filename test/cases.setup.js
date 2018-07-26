import { basename, join } from 'path';
import webpack from 'webpack';
import I18nYii2ExtractPlugin from '../src';

const casesPath = join(__dirname, 'cases');

const expandLanguagesMap = (name, languages, pattern) => {
  const result = {};
  languages.forEach((language) => {
    result[`${name}@${language}`] = pattern.replace(/\[language]/g, language);
  });
  return result;
};

export default function processFile(entry, pluginOpts = {}) {
  let resolvedEntry;
  let resolvedOutput;
  let pluginOutput;
  let pluginOutputResolved;

  const { languages = ['en-US'] } = pluginOpts;

  if (typeof entry === 'object') {
    resolvedEntry = {};
    resolvedOutput = '[name].tmp.js';
    pluginOutput = '[name].[language].tmp.json';
    pluginOutputResolved = {};
    Object.keys(entry).forEach((name) => {
      const file = entry[name];
      resolvedEntry[name] = join(casesPath, file);
      const ePluginOutputBase = `${name}.[language].tmp.json`;
      pluginOutputResolved = {
        ...pluginOutputResolved,
        ...expandLanguagesMap(
          name,
          languages,
          join(casesPath, ePluginOutputBase),
        ),
      };
    });
  } else {
    resolvedEntry = join(casesPath, entry);
    const eBasename = basename(entry, '.code.js');
    resolvedOutput = `${eBasename}.tmp.js`;
    const pluginOutputBasename = `${eBasename}.[language].tmp.json`;
    // here use absolute path to unsure it works
    pluginOutput = join(casesPath, pluginOutputBasename);
    pluginOutputResolved = expandLanguagesMap(eBasename, languages, pluginOutput);
  }

  const options = {
    inputFileName: `${basename(pluginOutput, '.tmp.json')}.src.json`,
    ...pluginOpts,
    outputFileName: pluginOutput,
  };
  const compiler = webpack({
    mode: 'none',
    entry: resolvedEntry,
    output: {
      filename: resolvedOutput,
      path: casesPath,
      libraryTarget: 'commonjs2',
    },
    plugins: [
      new I18nYii2ExtractPlugin(options),
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
        files: pluginOutputResolved,
        stats,
      });
    });
  });
}
