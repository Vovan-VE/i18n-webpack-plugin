/* eslint-disable import/newline-after-import */
/* globals i18n */
exports.first = i18n.t('category1', 'Message 1');
exports.second = i18n.t('category1', 'Message 2');
exports.imported = require('./imported.code').imported;
exports.third = i18n.t('category2', 'Message 3');
