import processFile from '../cases.setup';

describe('options.functionName', () => {
  describe('the object notation', () => {
    let translated;

    beforeAll(() => {
      const options = {
        functionName: 'i18n',
      };

      return processFile('opts-function-name.code.js', options)
        .then(({ file }) => {
          translated = require.requireActual(file);
        });
    });

    it('should return translated keys', () => {
      expect(translated).toMatchSnapshot();
    });
  });
});
