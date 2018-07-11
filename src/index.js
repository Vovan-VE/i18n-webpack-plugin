/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
  Contributor Vovan-VE <vovan-ve@yandex.ru>
*/
import { isAbsolute, relative, resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import ConstDependency from 'webpack/lib/dependencies/ConstDependency';
import NullFactory from 'webpack/lib/NullFactory';
import RawSource from 'webpack-sources/lib/RawSource';

const makeModulesMap = (modules) => {
  const map = {};
  const children = {};
  modules.forEach((module) => {
    const { debugId, issuer } = module;
    map[debugId] = module;
    if (issuer) {
      const parentId = issuer.debugId;
      (children[parentId] || (children[parentId] = [])).push(debugId);
    }
  });
  return { map, children };
};

const getRootRelatedModules = (modulesMap, parsedModules) => {
  const roots = {};
  const related = {};
  let list = Object.keys(parsedModules);
  while (list.length) {
    const next = {};
    list.forEach((debugId) => {
      if (!related[debugId]) {
        const module = modulesMap[debugId];
        related[debugId] = module;
        const { issuer } = module;
        if (issuer) {
          next[issuer.debugId] = true;
        } else {
          roots[debugId] = module;
        }
      }
    });
    list = Object.keys(next);
  }
  return roots;
};

const mergeTranslations = (add, collected, modules, children, id) => {
  const { [id]: categories } = collected;
  if (!categories) {
    return;
  }
  Object.keys(categories).forEach((category) => {
    const messages = categories[category];
    const addToCategory = add(category);
    Object.keys(messages).forEach(addToCategory);
  });

  const childrenIds = children[id];
  if (childrenIds) {
    childrenIds.forEach((childId) => {
      mergeTranslations(add, collected, modules, children, childId);
    });
  }
};

const buildUpdate = (collected, parsedModules, modules) => {
  const { map, children } = makeModulesMap(modules);
  const updateRoots = getRootRelatedModules(map, parsedModules);
  const merged = {};
  Object.keys(updateRoots).forEach((id) => {
    const mergedForModule = {};
    const add = (category) => {
      const inCategory = mergedForModule[category] || (mergedForModule[category] = {});
      return (message) => {
        inCategory[message] = inCategory[message] || '';
      };
    };
    mergeTranslations(add, collected, modules, children, id);
    merged[id] = mergedForModule;
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
    this.outputFileName = this.options.outputFileName || '[name].json';
    this.inputFileName = this.options.inputFileName || this.outputFileName;
    // use default value only in case of undefined
    ({ outputSpace: this.outputSpace = 2 } = this.options);
  }

  apply(compiler) {
    const { inputFileName, outputFileName } = this;
    const name = this.functionName;
    const plugin = { name: 'I18nYii2ExtractPlugin' };
    const collected = {};
    let parsedModules;

    compiler.hooks.compilation.tap(plugin, (compilation) => {
      compilation.dependencyFactories.set(ConstDependency, new NullFactory());
    });

    compiler.hooks.compilation.tap(plugin, (compilation, { normalModuleFactory }) => {
      parsedModules = {};

      compilation.hooks.buildModule.tap(plugin, (module) => {
        collected[module.debugId] = {};
      });

      compilation.hooks.record.tap(plugin, (compilationInner, records) => {
        const {
          modules,
          compiler: { outputPath },
        } = compilationInner;
        const update = buildUpdate(collected, parsedModules, modules);

        const chunkNames = {};
        const { byName } = records.chunks;
        Object.keys(byName).forEach((chunkName) => {
          chunkNames[byName[chunkName]] = chunkName;
        });
        const completeFileName = (pattern, id) => pattern.replace(/\[name]/g, chunkNames[id]);

        modules.forEach((module) => {
          const { id, debugId } = module;
          if (!update[debugId]) {
            return;
          }
          if (!chunkNames[id]) {
            return;
          }
          const [outLocalName, outAbsName] = fulfillFilePaths(
            completeFileName(outputFileName, id),
            outputPath,
          );
          let inAbsName;
          if (inputFileName) {
            [, inAbsName] = fulfillFilePaths(completeFileName(inputFileName, id), outputPath);
          } else {
            inAbsName = outAbsName;
          }

          const updated = loadOldTranslations(inAbsName, update[debugId]);

          // eslint-disable-next-line no-param-reassign
          compilationInner.assets[outLocalName] = new RawSource(
            JSON.stringify(updated, null, this.outputSpace),
          );
        });

        parsedModules = null;
      });

      const parserHook = normalModuleFactory.hooks.parser;
      const parserHandler = (parser) => {
        parser.hooks.call.for(name).tap(plugin, (expr) => {
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
          if (!parsedModules[debugId]) {
            parsedModules[debugId] = debugId;
          }
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
