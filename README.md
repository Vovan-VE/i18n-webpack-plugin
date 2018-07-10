i18n-yii2-extract-webpack-plugin
--------------------------------

Fork based on [i18n Plugin][source-url]
at [8a51991b5b][source-fork-base-url]
which was a head of branch [`feature/webpack_4`][source-form-branch-url]
at the moment of fork.

The plugin will extract source messages at build time to separate files for future translation.

The plugin uses categorized messages like [Yii2 I18N][yii2-i18n] uses:

```js
console.log(i18n.t('category', 'Test message'));
console.log(i18n.t('category/subcategory', 'Hello, {name}', {name: 'Mr. Smith'}));
```

Install
-------

```bash
npm i -D i18n-webpack-plugin
```

Usage
-----

This plugin creates/updates separate JSON files containing all source messages for translation.
Each entry produce separate JSON file. This may duplicate messages in case of multiple entries,
so later processing and/or automation is recommended (and is not part of this plugin).

Options
-------

```
plugins: [
  ...
  new I18nYii2ExtractPlugin(optionsObj)
],
```

where `optionsObj` is an object with following possible properties:

*   `functionName`: the default value is `"i18n.t"`, you can change it to other function name.
*   `hideMessage`: the default value is `false`, which will show the warning/error message.
    If set to `true`, the message will be hidden.
*   `outputFileName`: the default value is `"[name].json"`, which will control generated file name
    to save extracted messages. Relative path will resolve from configured output path.
    Following patterns are allowed:
    *   `[name]`: entry chunk name
*   `outputSpace`: the default value is `2`. The value will pass as 3rd `space` argument to
    `JSON.stringify()` to control pretty print. You can use `null`, `0`, or `""` to disable pretty
    print. The value `undefined` will fallback to default value `2`.

[source-url]: https://github.com/webpack-contrib/i18n-webpack-plugin
[source-fork-base-url]: https://github.com/webpack-contrib/i18n-webpack-plugin/commit/8a51991b5b9d7c0dd952c7470a51f0a2ac4049c1
[source-form-branch-url]: https://github.com/webpack-contrib/i18n-webpack-plugin/tree/feature/webpack_4
[yii2-i18n]: https://www.yiiframework.com/doc/guide/2.0/en/tutorial-i18n
