/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
  Contributor Vovan-VE <vovan-ve@yandex.ru>
*/
import { isAbsolute, relative, resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import jsonStringify from 'json-stable-stringify';
import ConstDependency from 'webpack/lib/dependencies/ConstDependency';
import NullFactory from 'webpack/lib/NullFactory';
import RawSource from 'webpack-sources/lib/RawSource';

const makeModulesMap = (modules) => {
  const children = {};
  const parents = {};
  modules.forEach((module) => {
    const { debugId } = module;

    function childrenFromDependency({ dependencies, blocks }) {
      if (dependencies) {
        dependencies.forEach((dep) => {
          const child = dep.getReference();
          if (child) {
            const childId = child.module.debugId;
            (children[debugId] || (children[debugId] = {}))[childId] = childId;
            (parents[childId] || (parents[childId] = {}))[debugId] = debugId;
          }
        });
      }
      if (blocks) {
        blocks.forEach(childrenFromDependency);
      }
    }

    childrenFromDependency(module);
  });
  return { children, parents };
};

const getRootRelatedModules = (parentsMap, parsedModules) => {
  const roots = {};
  const related = {};
  let list = Object.keys(parsedModules);
  while (list.length) {
    const next = {};
    list.forEach((debugId) => {
      if (related[debugId]) {
        return;
      }

      related[debugId] = true;
      if (parentsMap[debugId]) {
        Object.keys(parentsMap[debugId]).forEach((parentId) => {
          next[parentId] = true;
        });
      } else {
        roots[debugId] = true;
      }
    });
    list = Object.keys(next);
  }
  return Object.keys(roots);
};

const mergeTranslations = (collected, children, rootId, addFactory) => {
  const passed = {};
  let current = [rootId];
  while (current.length) {
    const next = [];
    current.forEach((id) => {
      if (passed[id]) {
        return;
      }
      const { [id]: categories } = collected;
      if (categories) {
        Object.keys(categories).forEach((category) => {
          const messages = categories[category];
          const addToCategory = addFactory(category);
          Object.keys(messages).forEach(addToCategory);
        });
      }

      const childrenIds = children[id];
      if (childrenIds) {
        next.push(...Object.keys(childrenIds));
      }

      passed[id] = true;
    });
    current = next;
  }
};

const buildUpdate = (collected, parsedModules, modules) => {
  const { children, parents } = makeModulesMap(modules);
  const updateRoots = getRootRelatedModules(parents, parsedModules);
  const merged = {};
  updateRoots.forEach((id) => {
    const mergedForModule = {};
    let anything = false;
    mergeTranslations(collected, children, id, (category) => {
      const inCategory = mergedForModule[category] || (mergedForModule[category] = {});
      return (message) => {
        inCategory[message] = inCategory[message] || '';
        anything = true;
      };
    });
    if (anything) {
      merged[id] = mergedForModule;
    }
  });
  return merged;
};

const fulfillFilePaths = (file, basePath) => {
  let localName = file;
  let absName;
  if (isAbsolute(localName)) {
    absName = localName;
    localName = relative(basePath, localName);
  } else {
    absName = resolve(basePath, localName);
  }
  return [localName, absName];
};

const loadOldTranslations = (file, wanted) => {
  if (!existsSync(file)) {
    return wanted;
  }
  const content = readFileSync(file, 'utf8');
  const old = JSON.parse(content);
  const merged = {};
  Object.keys(wanted).forEach((category) => {
    const wantedMessages = wanted[category];
    const oldMessages = old[category];
    if (oldMessages) {
      const mergedCategory = merged[category] || (merged[category] = {});
      Object.keys(wantedMessages).forEach((message) => {
        mergedCategory[message] = oldMessages[message] || wantedMessages[message];
      });
    } else {
      merged[category] = { ...wantedMessages };
    }
  });
  return merged;
};

const compareKeysCaseless = ({ key: aKey }, { key: bKey }) => {
  const aI = aKey.toLowerCase();
  const bI = bKey.toLowerCase();
  return (aI < bI && -1) || (aI > bI && 1) || 0;
};

const completeFileName = (pattern, name, language) => (
  pattern
    .replace(/\[language]/g, language)
    .replace(/\[name]/g, name)
);

/**
 *
 * @param {object|string} Options object
 * @constructor
 */
class I18nYii2ExtractPlugin {
  constructor(options) {
    this.options = options || {};
    this.functionName = this.options.functionName || 'i18n.t';
    // currently unused but reserved
    this.hideMessage = this.options.hideMessage || false;
    this.outputFileName = this.options.outputFileName || '[name].[language].json';
    this.inputFileName = this.options.inputFileName || this.outputFileName;
    // use default value only in case of undefined
    ({ outputSpace: this.outputSpace = 2 } = this.options);
    this.languages = this.options.languages || ['en-US'];
  }

  apply(compiler) {
    const { functionName, inputFileName, outputFileName, outputSpace, languages } = this;
    const plugin = { name: 'I18nYii2ExtractPlugin' };
    const jsonOptions = {
      cmp: compareKeysCaseless,
      space: outputSpace,
    };
    const collected = {};
    let parsedModules = {};

    compiler.hooks.compilation.tap(plugin, (compilation) => {
      compilation.dependencyFactories.set(ConstDependency, new NullFactory());
    });

    compiler.hooks.compilation.tap(plugin, (compilation, { normalModuleFactory }) => {
      compilation.hooks.buildModule.tap(plugin, (module) => {
        const { debugId } = module;
        if (!parsedModules[debugId]) {
          parsedModules[debugId] = debugId;
          // since this module is rebuilding completely,
          // clear its old data on first hit in the build
          delete collected[debugId];
        }
      });

      compilation.hooks.record.tap(plugin, (compilationInner) => {
        const {
          modules,
          compiler: { outputPath },
        } = compilationInner;
        const update = buildUpdate(collected, parsedModules, modules);

        modules.forEach((module) => {
          const { debugId } = module;
          if (!update[debugId]) {
            return;
          }
          if (!module.isEntryModule()) {
            return;
          }
          const chunks = module.getChunks();
          if (chunks.length !== 1) {
            return;
          }
          const { 0: { name } } = chunks;
          languages.forEach((language) => {
            const [outLocalName, outAbsName] = fulfillFilePaths(
              completeFileName(outputFileName, name, language),
              outputPath,
            );
            let inAbsName;
            if (inputFileName) {
              [, inAbsName] = fulfillFilePaths(
                completeFileName(inputFileName, name, language),
                outputPath,
              );
            } else {
              inAbsName = outAbsName;
            }

            const updated = loadOldTranslations(inAbsName, update[debugId]);

            // eslint-disable-next-line no-param-reassign
            compilationInner.assets[outLocalName] = new RawSource(
              `${jsonStringify(updated, jsonOptions)}\n`,
            );
          });
        });

        parsedModules = {};
      });

      const parserHook = normalModuleFactory.hooks.parser;
      const parserHandler = (parser) => {
        parser.hooks.call.for(functionName).tap(plugin, (expr) => {
          let message;
          let category;
          if (expr.arguments.length < 2) {
            return false;
          }

          category = parser.evaluateExpression(expr.arguments[0]);
          if (!category.isString()) return false;
          category = category.string;
          message = parser.evaluateExpression(expr.arguments[1]);
          if (!message.isString()) return false;
          message = message.string;

          const { debugId } = parser.state.module;
          const collectedInModule = collected[debugId] || (collected[debugId] = {});
          (collectedInModule[category] || (collectedInModule[category] = {}))[message] = '';

          // let error = parser.state.module[__dirname];
          // if (!error) {
          //   error = new MissingLocalizationError(parser.state.module, param, defaultValue);
          //   parser.state.module[__dirname] = error;
          //
          //   if (...) {
          //     parser.state.module.errors.push(error);
          //   } else if (!hideMessage) {
          //     parser.state.module.warnings.push(error);
          //   }
          // } else if (!error.requests.includes(param)) {
          //   error.add(param, defaultValue);
          // }

          return false;
        });
      };

      parserHook.for('javascript/auto').tap(plugin, parserHandler);
      parserHook.for('javascript/dynamic').tap(plugin, parserHandler);
      parserHook.for('javascript/esm').tap(plugin, parserHandler);
    });
  }
}

export default I18nYii2ExtractPlugin;
