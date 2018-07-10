import fs from 'fs';
import processFile from '../cases.setup';

describe('extract-entry-map', () => {
  const extracted = {};

  beforeAll(() => processFile([
    'extract-entry-map-bar.code.js',
    'extract-entry-map-foo.code.js',
  ])
    .then(({ files }) => {
      Object.keys(files).forEach((name) => {
        extracted[name] = {
          name,
          content: fs.readFileSync(files[name], 'utf8'),
        };
      });
    }));

  it('should return extracted keys', () => {
    Object.keys(extracted).forEach((name) => {
      expect(extracted[name]).toMatchSnapshot();
    });
    // expect(extracted).toMatchSnapshot();
  });
});
