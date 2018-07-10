import processFile from '../cases.setup';

describe('extract-translations', () => {
  let extracted;

  beforeAll(() => processFile('extract-translations.code.js')
      .then(({ file }) => {
        extracted = require.requireActual(file);
      }));

  it('should return extracted keys', () => {
    expect(extracted).toMatchSnapshot();
  });
});
