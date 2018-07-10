import processFile from '../cases.setup';

describe('apply-translations', () => {
  let translated;

  beforeAll(() => processFile('apply-translations.code.js')
      .then(({ file }) => {
        translated = require.requireActual(file);
      }));

  it('should return translated keys', () => {
    expect(translated).toMatchSnapshot();
  });
});
