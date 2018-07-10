/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
import ConstDependency from 'webpack/lib/dependencies/ConstDependency';
import NullFactory from 'webpack/lib/NullFactory';

/**
 *
 * @param {object|string} Options object or obselete functionName string
 * @constructor
 */
class I18nYii2ExtractPlugin {
  constructor(options) {
    this.options = options || {};
    this.functionName = this.options.functionName || '__';
    this.hideMessage = this.options.hideMessage || false;
  }

  apply(compiler) {
    // const { hideMessage } = this; // eslint-disable-line no-unused-vars
    const name = this.functionName;
    const plugin = { name: 'I18nYii2ExtractPlugin' };

    compiler.hooks.compilation.tap(plugin, (compilation, params) => { // eslint-disable-line no-unused-vars
      compilation.dependencyFactories.set(ConstDependency, new NullFactory());
      compilation.dependencyTemplates.set(ConstDependency, new ConstDependency.Template());
    });

    compiler.hooks.compilation.tap(plugin, (compilation, data) => {
      const parserHook = data.normalModuleFactory.hooks.parser;
      const parserHandler = (parser, options) => { // eslint-disable-line no-unused-vars
        parser.hooks.call.for(name).tap(plugin, (expr) => {
          let param;
          let defaultValue;
          switch (expr.arguments.length) {
            case 2:
              param = parser.evaluateExpression(expr.arguments[1]);
              if (!param.isString()) return false;
              param = param.string;
              defaultValue = parser.evaluateExpression(expr.arguments[0]);
              if (!defaultValue.isString()) return false;
              defaultValue = defaultValue.string;
              break;
            default:
              return false;
          }

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
