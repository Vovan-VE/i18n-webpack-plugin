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


Options
-------

```
plugins: [
  ...
  new I18nYii2ExtractPlugin(optionsObj)
],
```

where `optionsObj` is an object with following possible properties:

*   `functionName`: the default value is `i18n.t`, you can change it to other function name.
*   `hideMessage`: the default value is `false`, which will show the warning/error message.
    If set to `true`, the message will be hidden.


[source-url]: https://github.com/webpack-contrib/i18n-webpack-plugin
[source-fork-base-url]: https://github.com/webpack-contrib/i18n-webpack-plugin/commit/8a51991b5b9d7c0dd952c7470a51f0a2ac4049c1
[source-form-branch-url]: https://github.com/webpack-contrib/i18n-webpack-plugin/tree/feature/webpack_4
[yii2-i18n]: https://www.yiiframework.com/doc/guide/2.0/en/tutorial-i18n
