import processFile from '../cases.setup';

describe('extract-entry-map', () => {
  const extracted = {};

  beforeAll(() => processFile([
    'extract-entry-map-bar.code.js',
    'extract-entry-map-foo.code.js',
  ])
    .then(({ files }) => {
      Object.keys(files).forEach((name) => {
        extracted[name] = require.requireActual(files[name]);
      });
    }));

  it('should return extracted keys', () => {
    expect(extracted).toMatchSnapshot();
  });
});
