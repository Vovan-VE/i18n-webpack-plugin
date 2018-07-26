/* globals i18n */
/* eslint-disable import/newline-after-import */
exports.first = i18n.t('category1', 'Message 1');
exports.second = i18n.t('category1', 'Message 2');
exports.third = i18n.t('category2', 'Message 3');
exports.imported = require('./imported.code').imported;
exports.fourth = i18n.t('category100', 'Message 100');
exports.fifth = i18n.t('category', 'Message');
exports.sixth = i18n.t('category1', 'Message 10');
