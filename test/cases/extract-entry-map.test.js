import fs from 'fs';
import processFile from '../cases.setup';

describe('extract-entry-map', () => {
  const extracted = [];

  beforeAll(() => processFile([
    'extract-entry-map-bar.code.js',
    'extract-entry-map-foo.code.js',
  ])
    .then(({ files }) => {
      Object.keys(files).forEach((name) => {
        extracted.push({
          name,
          content: fs.readFileSync(files[name], 'utf8'),
        });
      });
    }));

  it('should return extracted keys', () => {
    // extracted.forEach(({ content }) => {
    //   expect(content).toMatchSnapshot();
    // });
    expect(extracted).toMatchSnapshot();
  });
});
