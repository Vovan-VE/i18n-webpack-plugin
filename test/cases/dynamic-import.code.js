/* globals i18n */
exports.first = i18n.t('category1', 'Message 1');
exports.second = i18n.t('category1', 'Message 2');
exports.third = i18n.t('category2', 'Message 3');

let fourth;
exports.getFourth = () => fourth;
require.ensure(
  ['./imported.code'],
  (require) => {
    fourth = require('./imported.code').imported;
  },
  () => {
    throw new Error('Cannot perform dynamic import');
  },
  'dynamic-import-child',
);
