import processFile from '../cases.setup';

describe('dynamic-import', () => {
  let extracted;

  beforeAll(() => processFile('dynamic-import.code.js')
      .then(({ file }) => {
        extracted = require.requireActual(file);
      }));

  it('should return extracted keys', () => {
    expect(extracted).toMatchSnapshot();
  });
});
