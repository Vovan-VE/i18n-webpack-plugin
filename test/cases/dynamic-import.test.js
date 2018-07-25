import fs from 'fs';
import processFile from '../cases.setup';

describe('dynamic-import', () => {
  const extracted = [];

  beforeAll(() => processFile('dynamic-import.code.js')
    .then(({ files }) => {
      Object.keys(files).forEach((name) => {
        extracted.push({
          name,
          content: fs.readFileSync(files[name], 'utf8'),
        });
      });
    }));

  it('should return extracted keys', () => {
    expect(extracted).toMatchSnapshot();
  });
});
